import { expect, test } from "@playwright/test";

test("production serves the SPA shell over HTTPS", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  expect(response?.url().startsWith("https://")).toBe(true);
  await expect(page.locator("#root")).toBeAttached();
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
    page.locator("a[href='https://github.com/jlvmoster']"),
  ).toBeVisible();
  await expect(
    page.locator("a[href='https://instagram.com/jlvmoster']"),
  ).toBeVisible();
  await expect(
    page.locator("a[href='https://linkedin.com/in/jlvmoster']"),
  ).toBeVisible();
});

test("production applies Tailwind utility classes", async ({ page }) => {
  await page.goto("/");

  const heroStyles = await page.locator("#hero").evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      maxWidth: cs.maxWidth,
      paddingLeft: parseFloat(cs.paddingLeft),
      paddingTop: parseFloat(cs.paddingTop),
    };
  });
  expect(heroStyles.maxWidth).not.toBe("none");
  expect(heroStyles.paddingLeft).toBeGreaterThan(0);
  expect(heroStyles.paddingTop).toBeGreaterThan(0);

  const heroHeadingStyles = await page.locator("#hero h1").evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      fontFamily: cs.fontFamily,
      fontSize: parseFloat(cs.fontSize),
    };
  });
  expect(heroHeadingStyles.fontFamily.toLowerCase()).toContain("serif");
  expect(heroHeadingStyles.fontSize).toBeGreaterThanOrEqual(24);

  const ghLinkDisplay = await page
    .locator("a[href='https://github.com/jlvmoster']")
    .evaluate((el) => getComputedStyle(el).display);
  expect(ghLinkDisplay).toBe("inline-flex");
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

test("production returns the SPA shell for unknown paths", async ({ page }) => {
  const response = await page.goto("/some-unknown-path");
  expect(response?.status()).toBe(200);
  await expect(page.locator("#root")).toBeAttached();
});
