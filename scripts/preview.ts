// Files in dist/ win (Vercel checks the filesystem before rewrites).
// vercel.json rewrites then serve the SPA shell at 200.
// Anything else is dist/404.html at 404 — Vercel's root 404 page.
const DIST = "dist";

type Rewrite = { source: string; destination: string };

const config = (await Bun.file("vercel.json").json()) as {
  rewrites?: Rewrite[];
};

const rewrites = (config.rewrites ?? []).map((rewrite) => ({
  destination: rewrite.destination,
  pattern: rewriteSource(rewrite.source),
}));

// shortcut: literals and one :param segment only, upgrade when a rewrite uses a splat or a regex
function rewriteSource(source: string): RegExp {
  const pattern = source
    .split("/")
    .map((segment) =>
      segment.startsWith(":")
        ? "[^/]+"
        : segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    )
    .join("/");
  return new RegExp(`^${pattern}$`);
}

const server = Bun.serve({
  port: Number(process.env.PORT ?? 4173),
  async fetch(req) {
    const pathname = new URL(req.url).pathname;
    const filePath = pathname === "/" ? "/index.html" : pathname;
    const file = Bun.file(DIST + filePath);
    if (await file.exists()) return new Response(file);

    const rewrite = rewrites.find((entry) => entry.pattern.test(pathname));
    if (rewrite) return new Response(Bun.file(DIST + rewrite.destination));

    return new Response(Bun.file(`${DIST}/404.html`), { status: 404 });
  },
});

console.log(`preview server: ${server.url}`);
