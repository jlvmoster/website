import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "**/production.e2e.ts",
  fullyParallel: true,
  use: {
    baseURL: process.env.PRODUCTION_URL ?? "https://moster.dev",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
