import { expect, test } from "@playwright/test";
import { knownArticleTitle } from "./known-article-slug";
import { expectMobileMenuAboveAvatar } from "./mobile-menu-stack";

test("production serves the SPA shell over HTTPS", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  expect(response?.url().startsWith("https://")).toBe(true);
  await expect(page.locator("#root")).toBeAttached();
});

// The only check that the vercel.json `headers` block is actually live —
// scripts/preview.ts does not serve them, so built.e2e.ts cannot cover this.
test("production sends the vercel.json security headers", async ({
  request,
}) => {
  const headers = (await request.get("/")).headers();
  expect(headers["strict-transport-security"]).toContain("max-age=");
  expect(headers["content-security-policy"]).toContain("default-src 'self'");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
  expect(headers["permissions-policy"]).toContain("camera=()");
});

test("production renders the canonical hero copy verbatim", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByText("It's my pleasure to invite you into my portfolio."),
  ).toBeVisible();
});

test("production exposes the three canonical social links", async ({
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

test("production applies Tailwind utility classes", async ({ page }) => {
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

test("production applies dark mode via prefers-color-scheme", async ({
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

test("unknown article slugs return 404 and a known slug returns 200", async ({
  page,
}) => {
  const slug = "hello-world";
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

test("production mobile menu links paint above the hero avatar", async ({
  page,
}) => {
  await test.step("home", async () => {
    await expectMobileMenuAboveAvatar(page, "/");
  });
  await test.step("home scrolled 400px", async () => {
    await expectMobileMenuAboveAvatar(page, "/", 400);
  });
  await test.step("/uses", async () => {
    await expectMobileMenuAboveAvatar(page, "/uses");
  });
});

test("production returns 200 for known routes and 404 for unknown paths", async ({
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

  await test.step("/about/", async () => {
    const redirect = await page.request.get("/about/", { maxRedirects: 0 });
    expect(redirect.status()).toBe(308);
    const location = redirect.headers().location ?? "";
    expect(new URL(location, "http://127.0.0.1").pathname).toBe("/about");

    const followed = await page.goto("/about/");
    expect(followed?.status()).toBe(200);
    await expect(page).toHaveURL(/\/about$/);
  });

  const response = await page.goto("/some-unknown-path");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Page not found." }),
  ).toBeVisible();
});
