#!/usr/bin/env bash
# Install UI/UX agent skills into the Cloud Agent home — not into the website repo.
# Invoked from .cursor/environment.json `install`. Failures here should not fail the site build.
set -u
export PATH="$HOME/.bun/bin:$PATH:${PATH:-}"

log() { printf '[install-ui-skills] %s\n' "$*"; }

# Prefer a real Node for skill CLIs; fall back to bunx where possible.
if ! command -v npm >/dev/null 2>&1; then
  if [ -s "$HOME/.nvm/nvm.sh" ]; then
    # shellcheck disable=SC1090
    . "$HOME/.nvm/nvm.sh"
  fi
fi

if ! command -v npm >/dev/null 2>&1 && command -v bun >/dev/null 2>&1; then
  log "npm missing; attempting bun-based installs where possible"
fi

install_ok=0

if command -v npm >/dev/null 2>&1; then
  npm install -g ui-ux-pro-max-cli >/dev/null 2>&1 && \
    uipro init -a cursor -g -f >/dev/null 2>&1 && \
    log "ui-ux-pro-max installed" && install_ok=1 || log "ui-ux-pro-max install failed (non-fatal)"

  npx --yes skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend -g -a cursor -y --copy >/dev/null 2>&1 && \
    log "taste-skill installed" || log "taste-skill install failed (non-fatal)"

  npx --yes skills@latest add emilkowalski/skills -g -a cursor -y --copy >/dev/null 2>&1 && \
    log "emilkowalski/skills installed" || log "emilkowalski/skills install failed (non-fatal)"

  npx --yes impeccable install --providers=cursor --scope=global -y --no-hooks --force >/dev/null 2>&1 && \
    log "impeccable installed" || log "impeccable install failed (non-fatal)"
else
  log "skipping skill CLIs — npm unavailable"
fi

mkdir -p "$HOME/.cursor/skills"
if [ -d "$HOME/.agents/skills" ]; then
  for d in "$HOME"/.agents/skills/*/; do
    [ -d "$d" ] || continue
    ln -sfn "$d" "$HOME/.cursor/skills/$(basename "$d")"
  done
  log "mirrored ~/.agents/skills → ~/.cursor/skills"
fi

# Always exit 0 so a skill CDN blip does not fail bun install / browser setup.
exit 0
