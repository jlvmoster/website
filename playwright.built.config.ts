import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "**/built.e2e.ts",
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:8787",
  },
  webServer: {
    command: "bun run build && bun run preview",
    url: "http://localhost:8787",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
