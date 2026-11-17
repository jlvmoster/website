import { expect, test } from "bun:test";

test("vercel.json rewrites only the registered client routes to the SPA shell", async () => {
  const config = await Bun.file("vercel.json").json();

  // cleanUrls would publish 404.html at /404 with status 200. Leave it off.
  expect(config.cleanUrls ?? false).toBe(false);
  expect(config.trailingSlash).toBe(false);
  expect(config.routes).toBeUndefined();
  expect(config.rewrites).toEqual([
    { source: "/about", destination: "/index.html" },
    { source: "/articles", destination: "/index.html" },
    { source: "/articles/:slug", destination: "/index.html" },
    { source: "/projects", destination: "/index.html" },
    { source: "/uses", destination: "/index.html" },
  ]);
});
