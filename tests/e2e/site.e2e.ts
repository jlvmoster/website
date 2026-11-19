import { expect, test } from "@playwright/test";
import { expectMobileMenuAboveAvatar } from "./mobile-menu-stack";

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

test("home navbar hides after the avatar docks on scroll", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  const avatar = page.locator("a[aria-label='Home'] img");
  const navbar = page.locator("header > div.fixed");
  const before = await avatar.boundingBox();
  expect(before?.width).toBeGreaterThan(90);

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

test("mobile menu links paint above the hero avatar", async ({ page }) => {
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

  await page.getByRole("link", { name: "Go back to articles" }).click();
  await expect(page).toHaveURL(/\/articles$/);
});

test("home writing column links to the articles archive", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Writing" })).toBeVisible();
  await page.getByRole("link", { name: "View all" }).click();
  await expect(page).toHaveURL(/\/articles$/);
});

test("article card navigates without a full document reload", async ({
  page,
}) => {
  await page.goto("/articles");
  await page.evaluate(() => {
    (window as unknown as { __spa: number }).__spa = 1;
  });

  await page.getByRole("link", { name: "Hello, world" }).click();
  await expect(page).toHaveURL(/\/articles\/hello-world$/);

  const spa = await page.evaluate(
    () => (window as unknown as { __spa?: number }).__spa,
  );
  expect(spa).toBe(1);
});

test("article detail shows dek and reading time without a more-writing row", async ({
  page,
}) => {
  await page.goto("/articles/hello-world");

  await expect(
    page.getByRole("heading", { name: "Hello, world" }),
  ).toBeVisible();
  await expect(
    page.getByText("Why this site exists and what's coming."),
  ).toBeVisible();
  await expect(page.locator("time[datetime='2026-05-18']")).toBeVisible();
  await expect(page.getByText(/min read/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "More writing" })).toHaveCount(
    0,
  );
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

test("moon icon stroke matches on a light or dark OS and is zinc-400 on hover when the OS is dark", async ({
  browser,
  baseURL,
}) => {
  const readMoonStroke = async (
    colorScheme: "light" | "dark",
    hover: boolean,
  ) => {
    const context = await browser.newContext({ baseURL, colorScheme });
    const page = await context.newPage();
    try {
      await page.addInitScript(() => {
        localStorage.setItem("theme", "dark");
      });
      await page.goto("/");
      const toggle = page.getByRole("button", {
        name: "Switch to light theme",
      });
      if (hover) {
        await toggle.hover();
        await page.evaluate(() =>
          Promise.all(
            document.getAnimations().map((animation) => animation.finished),
          ),
        );
      }
      return await toggle
        .locator("svg")
        .nth(1)
        .locator("path")
        .evaluate((path) => {
          const accentProbe = document.createElement("span");
          accentProbe.style.color = getComputedStyle(document.documentElement)
            .getPropertyValue("--accent")
            .trim();
          const svg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg",
          );
          const zinc = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path",
          );
          zinc.setAttribute("class", "stroke-zinc-400");
          svg.append(zinc);
          document.body.append(accentProbe, svg);
          const accent = getComputedStyle(accentProbe).color;
          const zincStroke = getComputedStyle(zinc).stroke;
          accentProbe.remove();
          svg.remove();
          return {
            accent,
            stroke: getComputedStyle(path).stroke,
            zincStroke,
          };
        });
    } finally {
      await context.close();
    }
  };

  const lightOs = await readMoonStroke("light", false);
  const darkOs = await readMoonStroke("dark", false);
  expect(lightOs.stroke).toBe(darkOs.stroke);

  const lightOsHover = await readMoonStroke("light", true);
  expect(lightOsHover.stroke).toBe(lightOsHover.zincStroke);

  const darkOsHover = await readMoonStroke("dark", true);
  expect(darkOsHover.stroke).toBe(darkOsHover.zincStroke);
});

// Bun.serve in scripts/dev.ts is not Vercel. Unknown paths stay 200 here so
// HMR still paints NotFoundPage. The HTTP 404 contract is tests/e2e/built.e2e.ts.
test("dev server serves the SPA shell for unknown paths", async ({ page }) => {
  const response = await page.goto("/some-unknown-path");
  expect(response?.status()).toBe(200);
  await expect(page.locator("#root")).toBeAttached();
  await expect(
    page.getByRole("heading", { name: "Page not found." }),
  ).toBeVisible();
});

test("each route sets its own document title and description", async ({
  page,
}) => {
  const routes: Array<{
    path: string;
    title: RegExp;
    description: RegExp;
  }> = [
    {
      path: "/",
      title: /^Jalo Moster — Software Engineer at Chick-fil-A$/,
      description: /Personal site of Jalo Moster/,
    },
    {
      path: "/about",
      title: /^About — Jalo Moster$/,
      description: /Sr\. Lead Software Engineer at Chick-fil-A/,
    },
    {
      path: "/articles",
      title: /^Articles — Jalo Moster$/,
      description: /Notes on data systems/,
    },
    {
      path: "/articles/hello-world",
      title: / — Jalo Moster$/,
      description: /.+/,
    },
    {
      path: "/projects",
      title: /^Projects — Jalo Moster$/,
      description: /Things I've built/,
    },
    {
      path: "/uses",
      title: /^Uses — Jalo Moster$/,
      description: /hardware, software, and small luxuries/,
    },
    {
      path: "/some-unknown-path",
      title: /^Not found — Jalo Moster$/,
      description: /doesn't exist/,
    },
  ];

  for (const route of routes) {
    await page.goto(route.path);
    await expect(page).toHaveTitle(route.title);
    const description = await page
      .locator("head > meta[name='description']")
      .getAttribute("content");
    expect(description ?? "").toMatch(route.description);
  }
});

test("client-side navigation swaps document.title without a full reload", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    (window as unknown as { __navMarker: string }).__navMarker = "kept";
  });

  await page.locator("footer a[href='/about']").click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page).toHaveTitle(/^About — Jalo Moster$/);

  const marker = await page.evaluate(
    () => (window as unknown as { __navMarker?: string }).__navMarker,
  );
  expect(marker).toBe("kept");
});
