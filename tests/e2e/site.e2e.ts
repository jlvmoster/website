import { expect, test } from "@playwright/test";

test("home page loads with the React root attached", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("#root")).toBeAttached();
});

test("hero copy renders verbatim", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByText("It's my pleasure to invite you into my portfolio."),
  ).toBeVisible();
});

test("hero exposes the three canonical social links", async ({ page }) => {
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

test("dark mode swaps the body background via prefers-color-scheme", async ({
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

test("dev server serves the SPA shell for unknown paths", async ({ page }) => {
  const response = await page.goto("/some-unknown-path");
  expect(response?.status()).toBe(200);
  await expect(page.locator("#root")).toBeAttached();
});
