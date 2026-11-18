import { stat } from "node:fs/promises";

// Files in dist/ win (Vercel checks the filesystem before rewrites).
// With cleanUrls off and trailingSlash false, /dir serves dist/dir/index.html.
// vercel.json rewrites then serve the SPA shell at 200.
// Anything else is dist/404.html at 404 — Vercel's root 404 page.

const DIST = "dist";

type Rewrite = { source: string; destination: string };

const config = (await Bun.file("vercel.json").json()) as {
  rewrites?: Rewrite[];
  trailingSlash?: boolean;
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

async function isFile(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function staticFile(pathname: string): Promise<string | null> {
  if (pathname !== "/" && (await isFile(DIST + pathname))) {
    return DIST + pathname;
  }
  const index =
    pathname === "/" ? `${DIST}/index.html` : `${DIST}${pathname}/index.html`;
  return (await isFile(index)) ? index : null;
}

const server = Bun.serve({
  port: Number(process.env.PORT ?? 4173),
  async fetch(req) {
    const url = new URL(req.url);
    const { pathname } = url;
    // Same rule as vercel.json trailingSlash: false. `/` is unchanged.
    if (
      config.trailingSlash === false &&
      pathname.length > 1 &&
      pathname.endsWith("/")
    ) {
      url.pathname = pathname.slice(0, -1);
      return new Response(null, {
        status: 308,
        headers: { Location: `${url.pathname}${url.search}` },
      });
    }

    const file = await staticFile(pathname);
    if (file) return new Response(Bun.file(file));

    const rewrite = rewrites.find((entry) => entry.pattern.test(pathname));
    if (rewrite) return new Response(Bun.file(DIST + rewrite.destination));

    return new Response(Bun.file(`${DIST}/404.html`), { status: 404 });
  },
});

console.log(`preview server: ${server.url}`);
