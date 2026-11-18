import { expect, type Page } from "@playwright/test";

const navLabels = ["About", "Articles", "Projects", "Uses"];

// The anchor is full width, so its box center sits to the right of the 96px
// hero avatar. The avatar covers the left side of the row. Sample both.
async function expectNavLinksHit(page: Page) {
  const hits = await page.evaluate(() => {
    const dialog = document.querySelector("[role='dialog']");
    if (!dialog) return [];
    const avatar = document.querySelector("a[aria-label='Home']");
    const avatarRect = avatar?.getBoundingClientRect() ?? null;
    return [...dialog.querySelectorAll("a")].map((link) => {
      const rect = link.getBoundingClientRect();
      const points = [
        {
          kind: "center",
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        },
      ];
      if (avatarRect) {
        const left = Math.max(rect.left, avatarRect.left);
        const top = Math.max(rect.top, avatarRect.top);
        const right = Math.min(rect.right, avatarRect.right);
        const bottom = Math.min(rect.bottom, avatarRect.bottom);
        if (right - left > 1 && bottom - top > 1) {
          points.push({
            kind: "avatar-overlap",
            x: left + (right - left) / 2,
            y: top + (bottom - top) / 2,
          });
        }
      }
      return {
        label: link.textContent?.trim() ?? "",
        points: points.map((point) => {
          const top = document.elementFromPoint(point.x, point.y);
          return {
            kind: point.kind,
            x: Math.round(point.x),
            y: Math.round(point.y),
            onLink: !!top && (top === link || link.contains(top)),
            top: top
              ? `${top.tagName}${
                  top.getAttribute("aria-label")
                    ? `[aria-label=${top.getAttribute("aria-label")}]`
                    : ""
                }`
              : "null",
          };
        }),
      };
    });
  });

  expect(hits.map((hit) => hit.label)).toEqual(navLabels);
  for (const hit of hits) {
    expect(hit.points.some((point) => point.kind === "center")).toBe(true);
    for (const point of hit.points) {
      expect(
        point.onLink,
        `${hit.label} ${point.kind} (${point.x},${point.y}) hit ${point.top}, expected the link`,
      ).toBe(true);
    }
  }
}

export async function expectMobileMenuAboveAvatar(
  page: Page,
  path: string,
  scrollY = 0,
) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(path);
  if (scrollY > 0) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThanOrEqual(scrollY);
  }

  const menuButton = page.getByRole("button", { name: "Open menu" });
  const box = await menuButton.boundingBox();
  const viewport = page.viewportSize();
  const onScreen =
    !!box &&
    !!viewport &&
    box.y < viewport.height &&
    box.y + box.height > 0 &&
    box.x < viewport.width &&
    box.x + box.width > 0;
  if (onScreen) {
    await menuButton.click();
  } else {
    await menuButton.evaluate((button) => {
      (button as HTMLButtonElement).click();
    });
  }

  await expect(page.getByRole("heading", { name: "Navigation" })).toBeVisible();
  if (scrollY > 0) {
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(
      scrollY,
    );
  }
  await expectNavLinksHit(page);
}
