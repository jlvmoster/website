/**
 * Serve the production `dist/` output locally with SPA fallback.
 * Mirrors Vercel's rewrite-to-index.html behavior for client routes.
 */
const PORT = Number(process.env.PORT ?? 4173);
const DIST = "dist";

async function fileExists(path: string): Promise<boolean> {
  return Bun.file(path).exists();
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = decodeURIComponent(url.pathname);

    if (pathname.includes("..") || pathname.includes("\\")) {
      return new Response("Not found", { status: 404 });
    }

    if (pathname === "/") {
      return new Response(Bun.file(`${DIST}/index.html`));
    }

    const candidate = `${DIST}${pathname}`;
    if (await fileExists(candidate)) {
      return new Response(Bun.file(candidate));
    }

    // Directory-style path without extension → try index.html, else SPA shell
    if (!pathname.includes(".")) {
      const asDir = `${DIST}${pathname.replace(/\/$/, "")}/index.html`;
      if (await fileExists(asDir)) {
        return new Response(Bun.file(asDir));
      }
      return new Response(Bun.file(`${DIST}/index.html`));
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`preview server: ${server.url}`);
