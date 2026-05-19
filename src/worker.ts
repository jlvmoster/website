// Static response headers applied to every asset served by the Worker.
// Tuned for the Lighthouse "Trust and Safety" insights: HSTS, X-Frame-Options,
// Referrer-Policy, X-Content-Type-Options, COOP, Permissions-Policy, and a
// conservative Content-Security-Policy. The site has no inline forms or
// third-party iframes, so a strict policy is safe.
const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self' static.cloudflareinsights.com cloudflareinsights.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
};

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const res = await env.ASSETS.fetch(req);
    const headers = new Headers(res.headers);
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
      headers.set(k, v);
    }
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });
  },
} satisfies ExportedHandler<Env>;
