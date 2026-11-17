import { defineConfig, devices } from "@playwright/test";

// Local default: scripts/preview.ts on port 4173 (it applies vercel.json
// rewrites and the 404.html status; it does not send the headers block).
// Against a deployment that applies vercel.json itself:
//   E2E_BASE_URL=https://<preview-host> bun run test:e2e:built
// *.vercel.app previews sit behind Deployment Protection and will not
// answer this suite until that bypass is configured.
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:4173";

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "**/built.e2e.ts",
  fullyParallel: true,
  use: {
    baseURL,
  },
  ...(process.env.E2E_BASE_URL
    ? {}
    : {
        webServer: {
          command: "bun run build && bun run preview",
          url: "http://localhost:4173",
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }),
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
