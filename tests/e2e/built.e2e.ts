import { expect, test } from "@playwright/test";
import { knownArticleSlug, knownArticleTitle } from "./known-article-slug";

test("built artifact serves the SPA shell", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("#root")).toBeAttached();
});

test("built artifact renders the canonical hero copy verbatim", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByText("It's my pleasure to invite you into my portfolio."),
  ).toBeVisible();
});

test("built artifact exposes the three canonical social links", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Follow on GitHub" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Follow on Instagram" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Follow on LinkedIn" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Email Jalo" })).toBeVisible();
});

test("built artifact applies Tailwind utility classes", async ({ page }) => {
  await page.goto("/");

  const heroHeading = page.getByRole("heading", {
    name: "Jalo Moster",
    exact: true,
  });
  const heroHeadingStyles = await heroHeading.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      fontSize: parseFloat(cs.fontSize),
      fontWeight: Number(cs.fontWeight),
      marginTop: parseFloat(cs.marginTop),
    };
  });
  expect(heroHeadingStyles.fontSize).toBeGreaterThanOrEqual(36);
  expect(heroHeadingStyles.fontWeight).toBeGreaterThanOrEqual(700);
  expect(heroHeadingStyles.marginTop).toBe(0);

  const ghLinkPadding = await page
    .getByRole("link", { name: "Follow on GitHub" })
    .evaluate((el) => parseFloat(getComputedStyle(el).paddingTop));
  expect(ghLinkPadding).toBeGreaterThan(0);
});

test("built artifact applies dark mode via prefers-color-scheme", async ({
  browser,
}) => {
  const readBodyBackground = async (colorScheme: "light" | "dark") => {
    const context = await browser.newContext({ colorScheme });
    const page = await context.newPage();
    try {
      await page.goto("/");
      return await page
        .locator("body")
        .evaluate((el) => getComputedStyle(el).backgroundColor);
    } finally {
      await context.close();
    }
  };

  const lightBg = await readBodyBackground("light");
  const darkBg = await readBodyBackground("dark");

  expect(lightBg).not.toBe(darkBg);
});

test("known routes return 200 and unknown paths return the not-found page at 404", async ({
  page,
}) => {
  const known = [
    "/",
    "/about",
    "/articles",
    "/articles/hello-world",
    "/projects",
    "/uses",
  ];
  for (const path of known) {
    await test.step(path, async () => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
    });
  }

  const asset = await page.request.get("/images/avatar.jpg");
  expect(asset.status()).toBe(200);

  await test.step("/about/", async () => {
    const redirect = await page.request.get("/about/", { maxRedirects: 0 });
    expect(redirect.status()).toBe(308);
    const location = redirect.headers().location ?? "";
    expect(new URL(location, "http://127.0.0.1").pathname).toBe("/about");

    const response = await page.goto("/about/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/about$/);
  });

  const nested = await page.request.get("/articles/hello-world/more");
  expect(nested.status()).toBe(404);

  const missing = await page.goto("/some-unknown-path");
  expect(missing?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Page not found." }),
  ).toBeVisible();
});

test("unknown article slugs return 404 and a known slug returns 200", async ({
  page,
}) => {
  const slug = knownArticleSlug();
  const title = knownArticleTitle(slug);

  const known = await page.goto(`/articles/${slug}`);
  expect(known?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: title, level: 1 }),
  ).toBeVisible();

  const slashed = await page.request.get(`/articles/${slug}/`, {
    maxRedirects: 0,
  });
  expect(slashed.status()).toBe(308);
  expect(
    new URL(slashed.headers().location ?? "", "http://127.0.0.1").pathname,
  ).toBe(`/articles/${slug}`);

  const articles = await page.request.get("/articles/", { maxRedirects: 0 });
  expect(articles.status()).toBe(308);
  expect(
    new URL(articles.headers().location ?? "", "http://127.0.0.1").pathname,
  ).toBe("/articles");

  const missing = await page.goto("/articles/this-slug-does-not-exist");
  expect(missing?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Article not found." }),
  ).toBeVisible();
});

test("built artifact sets per-route document titles", async ({ page }) => {
  const routes: Array<{ path: string; title: RegExp }> = [
    { path: "/", title: /^Jalo Moster — Software Engineer at Chick-fil-A$/ },
    { path: "/about", title: /^About — Jalo Moster$/ },
    { path: "/articles", title: /^Articles — Jalo Moster$/ },
    { path: "/projects", title: /^Projects — Jalo Moster$/ },
    { path: "/uses", title: /^Uses — Jalo Moster$/ },
  ];

  for (const route of routes) {
    await page.goto(route.path);
    await expect(page).toHaveTitle(route.title);
  }
});

test("built artifact serves /cv.pdf as a PDF", async ({ request }) => {
  const response = await request.get("/cv.pdf");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/pdf");
  expect((await response.body()).byteLength).toBeGreaterThan(1000);
});
