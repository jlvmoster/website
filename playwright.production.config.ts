import { defineConfig, devices } from "@playwright/test";

const shareUrl = process.env.VERCEL_SHARE_URL?.trim();
const storageState = "playwright/.auth/vercel.json";

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "**/production.e2e.ts",
  fullyParallel: true,
  ...(shareUrl ? { globalSetup: "./tests/e2e/vercel-share.setup.ts" } : {}),
  use: {
    baseURL: process.env.PRODUCTION_URL ?? "https://moster.dev",
    ...(shareUrl ? { storageState } : {}),
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
