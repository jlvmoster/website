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

  const heroHeading = page.getByRole("heading", {
    name: "Software engineer building data systems at Chick-fil-A.",
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
    .locator("a[href='https://github.com/jlvmoster']")
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

test("production returns the SPA shell for unknown paths", async ({ page }) => {
  const response = await page.goto("/some-unknown-path");
  expect(response?.status()).toBe(200);
  await expect(page.locator("#root")).toBeAttached();
});
