#!/usr/bin/env bash
# Open a pull request as the moster-dev GitHub App.
# Usage: scripts/open-pr.sh <head> <base> <title> [body]
set -euo pipefail
set +x

usage() {
  echo "usage: $0 <head> <base> <title> [body]" >&2
  exit 2
}

[[ $# -ge 3 && $# -le 4 ]] || usage

head_ref=$1
base_ref=$2
title=$3
body=${4:-}

if [[ -z "$head_ref" || -z "$base_ref" || -z "$title" ]]; then
  usage
fi

if [[ -z "${MOSTER_DEV_APP_ID:-}" ]]; then
  echo "error: MOSTER_DEV_APP_ID is not set" >&2
  exit 1
fi
if [[ -z "${MOSTER_DEV_PRIVATE_KEY_B64:-}" ]]; then
  echo "error: MOSTER_DEV_PRIVATE_KEY_B64 is not set" >&2
  exit 1
fi

API=https://api.github.com

b64url() {
  openssl base64 -A | tr '+/' '-_' | tr -d '='
}

if [[ -n "${GITHUB_REPOSITORY:-}" ]]; then
  repo=${GITHUB_REPOSITORY%.git}
else
  origin=$(git remote get-url origin)
  origin=${origin%.git}
  origin=${origin%/}
  if [[ "$origin" != *github.com* ]]; then
    echo "error: origin remote is not a github.com repository URL" >&2
    exit 1
  fi
  origin=${origin#*github.com[:/]}
  repo=$(printf '%s' "$origin" | cut -d/ -f1-2)
fi

if [[ ! "$repo" =~ ^[^/]+/[^/]+$ ]]; then
  echo "error: could not determine owner/name for this repository" >&2
  exit 1
fi

key=$(mktemp)
chmod 600 "$key"
trap 'rm -f "$key"' EXIT
printf %s "$MOSTER_DEV_PRIVATE_KEY_B64" | openssl base64 -d -A > "$key"
if ! openssl rsa -check -noout -in "$key" >/dev/null 2>&1; then
  echo "error: MOSTER_DEV_PRIVATE_KEY_B64 is not a valid RSA private key" >&2
  exit 1
fi

now=$(date +%s)
hdr=$(printf '%s' '{"alg":"RS256","typ":"JWT"}' | b64url)
pay=$(printf '{"iat":%d,"exp":%d,"iss":"%s"}' "$((now - 60))" "$((now + 540))" "$MOSTER_DEV_APP_ID" | b64url)
sig=$(printf '%s.%s' "$hdr" "$pay" | openssl dgst -sha256 -sign "$key" | b64url)
jwt=${hdr}.${pay}.${sig}
unset sig

# github_request METHOD URL AUTH [JSON]
# Prints the response body. On an HTTP or transport error, prints GitHub's
# message (never the credential) and exits.
github_request() {
  local method=$1 url=$2 auth=$3 data=${4:-}
  local tmp code msg
  tmp=$(mktemp)
  if [[ -n "$data" ]]; then
    code=$(curl -sS --max-time 30 -o "$tmp" -w '%{http_code}' -X "$method" \
      -H "Authorization: Bearer ${auth}" \
      -H "Accept: application/vnd.github+json" \
      -H "Content-Type: application/json" \
      "$url" --data-binary "$data") || {
      rm -f "$tmp"
      echo "error: request to GitHub failed" >&2
      exit 1
    }
  else
    code=$(curl -sS --max-time 30 -o "$tmp" -w '%{http_code}' -X "$method" \
      -H "Authorization: Bearer ${auth}" \
      -H "Accept: application/vnd.github+json" \
      "$url") || {
      rm -f "$tmp"
      echo "error: request to GitHub failed" >&2
      exit 1
    }
  fi
  if [[ "$code" -lt 200 || "$code" -ge 300 ]]; then
    msg=$(jq -r '
      if (.message | type) == "string" then
        .message as $m
        | ([.errors[]? | (.message // ([.resource, .field, .code] | map(select(type == "string")) | join(" ")))]
           | map(select(length > 0)) | join("; ")) as $extra
        | if $extra == "" then $m else "\($m) (\($extra))" end
      else empty end
    ' "$tmp" 2>/dev/null || true)
    if [[ -z "$msg" ]]; then
      msg=$(head -c 400 "$tmp")
    fi
    rm -f "$tmp"
    echo "GitHub API error (${code}): ${msg}" >&2
    exit 1
  fi
  cat "$tmp"
  rm -f "$tmp"
}

inst=$(github_request GET "$API/repos/${repo}/installation" "$jwt" | jq -r '.id')
if [[ -z "$inst" || "$inst" == "null" ]]; then
  echo "error: GitHub did not return an installation id for ${repo}" >&2
  exit 1
fi

token=$(github_request POST "$API/app/installations/${inst}/access_tokens" "$jwt" | jq -r '.token')
if [[ -z "$token" || "$token" == "null" ]]; then
  echo "error: GitHub did not return an installation access token" >&2
  exit 1
fi

payload=$(jq -n \
  --arg head "$head_ref" \
  --arg base "$base_ref" \
  --arg title "$title" \
  --arg body "$body" \
  '{head:$head,base:$base,title:$title,body:$body}')

result=$(github_request POST "$API/repos/${repo}/pulls" "$token" "$payload" | jq -r '"\(.html_url) author=\(.user.login)"')
unset jwt token payload
if [[ "$result" != https://github.com/*/pull/*' author='* ]]; then
  echo "error: GitHub did not return a pull request URL and author" >&2
  exit 1
fi
printf '%s\n' "$result"
