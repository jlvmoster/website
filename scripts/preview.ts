// Serves the built dist/ with SPA fallback, mirroring the vercel.json rewrite.
const DIST = "dist";
const shell = Bun.file(`${DIST}/index.html`);

const server = Bun.serve({
  port: Number(process.env.PORT ?? 4173),
  async fetch(req) {
    const file = Bun.file(DIST + new URL(req.url).pathname);
    return new Response((await file.exists()) ? file : shell);
  },
});

console.log(`preview server: ${server.url}`);
