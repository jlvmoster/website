import { cp, rm } from "node:fs/promises";
import tailwindPlugin from "bun-plugin-tailwind";

await rm("dist", { recursive: true, force: true });

const result = await Bun.build({
  entrypoints: ["src/index.html"],
  outdir: "dist",
  publicPath: "/",
  minify: true,
  sourcemap: "linked",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  plugins: [tailwindPlugin],
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

await cp("public", "dist", { recursive: true });
// Vercel serves a root 404.html with status 404 when no file or rewrite matches.
// Same shell as index.html, so the client `*` route still paints NotFoundPage.
await cp("dist/index.html", "dist/404.html");
