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

test("home navbar hides after the avatar docks on scroll", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  const avatar = page.locator("a[aria-label='Home'] img");
  const navbar = page.locator("header > div.fixed");
  const before = await avatar.boundingBox();
  expect(before?.width).toBeGreaterThan(60);

  await page.evaluate(() => window.scrollTo(0, 136));
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThanOrEqual(136);

  const docked = await avatar.boundingBox();
  expect(docked?.width).toBeLessThan(40);
  expect(docked?.y).toBeGreaterThanOrEqual(20);

  const visibleNavbar = await navbar.evaluate((el) =>
    el.getBoundingClientRect().toJSON(),
  );
  expect(visibleNavbar.top).toBeGreaterThanOrEqual(0);

  await page.evaluate(() => window.scrollTo(0, 200));
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThanOrEqual(200);

  const hiddenNavbar = await navbar.evaluate((el) =>
    el.getBoundingClientRect().toJSON(),
  );
  expect(hiddenNavbar.bottom).toBeLessThanOrEqual(1);
});

test("page navbar hides on scroll", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/about");

  const navbar = page.locator("header > div.fixed");
  const before = await navbar.evaluate((el) =>
    el.getBoundingClientRect().toJSON(),
  );
  expect(before.top).toBeGreaterThanOrEqual(0);

  await page.evaluate(() => window.scrollTo(0, 96));
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThanOrEqual(96);

  const visibleNavbar = await navbar.evaluate((el) =>
    el.getBoundingClientRect().toJSON(),
  );
  expect(visibleNavbar.top).toBeLessThan(0);

  await page.evaluate(() => window.scrollTo(0, 128));
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThanOrEqual(128);

  const hiddenNavbar = await navbar.evaluate((el) =>
    el.getBoundingClientRect().toJSON(),
  );
  expect(hiddenNavbar.bottom).toBeLessThanOrEqual(1);
});

test("mobile menu opens and navigates", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.getByRole("navigation");
  await expect(page.getByRole("heading", { name: "Navigation" })).toBeVisible();

  await menu.getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL(/\/about$/);
});

test("route changes reset scroll to the top", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 200));
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThanOrEqual(200);

  await page.locator("footer a[href='/about']").click();
  await expect(page).toHaveURL(/\/about$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test("article back button returns to the articles page", async ({ page }) => {
  await page.goto("/articles/hello-world");

  await page.getByRole("button", { name: "Go back to articles" }).click();
  await expect(page).toHaveURL(/\/articles$/);
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

test("theme toggle applies dark mode immediately", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("theme", "light");
    document.documentElement.classList.remove("dark");
  });
  await page.reload();

  const toggled = await page
    .getByRole("button", { name: "Switch to dark theme" })
    .evaluate((button) => {
      (button as HTMLButtonElement).click();
      return {
        dark: document.documentElement.classList.contains("dark"),
        stored: localStorage.getItem("theme"),
      };
    });

  expect(toggled.dark).toBe(true);
  expect(toggled.stored).toBe("dark");
});

test("theme toggle switches back to light when system is dark", async ({
  browser,
}) => {
  const context = await browser.newContext({ colorScheme: "dark" });
  const page = await context.newPage();
  try {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    });
    await page.reload();

    await page
      .getByRole("button", { name: "Switch to dark theme" })
      .evaluate((button) => (button as HTMLButtonElement).click());
    expect(
      await page.evaluate(() =>
        document.documentElement.classList.contains("dark"),
      ),
    ).toBe(true);

    const light = await page
      .getByRole("button", { name: "Switch to light theme" })
      .evaluate((button) => {
        (button as HTMLButtonElement).click();
        return {
          dark: document.documentElement.classList.contains("dark"),
          stored: localStorage.getItem("theme"),
        };
      });

    expect(light.dark).toBe(false);
    expect(light.stored).toBe("light");
  } finally {
    await context.close();
  }
});

test("dev server serves the SPA shell for unknown paths", async ({ page }) => {
  const response = await page.goto("/some-unknown-path");
  expect(response?.status()).toBe(200);
  await expect(page.locator("#root")).toBeAttached();
});
