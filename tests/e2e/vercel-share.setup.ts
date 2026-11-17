import { chromium, type FullConfig } from "@playwright/test";

const shareParam = "_vercel_share";

function redact(text: string, shareUrl: string): string {
  const token = new URL(shareUrl).searchParams.get(shareParam);
  const needles = [shareUrl];
  if (token) needles.push(token, encodeURIComponent(token));
  let redacted = text;
  for (const needle of needles) {
    if (needle.length > 0) redacted = redacted.split(needle).join("[redacted]");
  }
  return redacted;
}

async function globalSetup(config: FullConfig) {
  const shareUrl = process.env.VERCEL_SHARE_URL?.trim();
  if (!shareUrl) return;

  const storageState = config.projects[0]?.use.storageState;
  if (typeof storageState !== "string") {
    throw new Error("production config is missing a storageState path");
  }

  try {
    const parsed = new URL(shareUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error("VERCEL_SHARE_URL must be an http(s) URL");
    }
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("VERCEL_SHARE_URL must be an absolute URL");
    }
    throw error;
  }

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    try {
      await page.goto(shareUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Vercel share link failed to load: ${redact(message, shareUrl)}`,
      );
    }
    const cookies = await page.context().cookies();
    if (!cookies.some((cookie) => cookie.name === "_vercel_jwt")) {
      throw new Error("Vercel share link did not set a _vercel_jwt cookie");
    }
    await page.context().storageState({ path: storageState });
  } finally {
    await browser.close();
  }
}

export default globalSetup;
