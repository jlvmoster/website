import { expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { App } from "../src/App";

test("App renders without throwing and contains the canonical home content", () => {
  const html = renderToStaticMarkup(
    createElement(MemoryRouter, { initialEntries: ["/"] }, createElement(App)),
  );
  const text = html.replace(/&#x27;/g, "'");

  expect(text).toContain("It's my pleasure to invite you into my portfolio.");
  expect(text).toContain(
    "Software engineer building data systems at Chick-fil-A.",
  );
  expect(html).toMatch(/<h2[^>]*>Writing<\/h2>/);
  expect(html).toMatch(/<h3[^>]*>[\s\S]*Hello, world/);
  expect(html).toMatch(/href="\/articles"[^>]*>View all/);
  expect(html).toContain("focus-visible:text-accent");

  for (const url of [
    "https://github.com/jlvmoster",
    "https://instagram.com/jlvmoster",
    "https://linkedin.com/in/jlvmoster",
    "mailto:jalo@moster.dev",
  ]) {
    expect(html).toContain(url);
  }

  expect(html).toContain("Jalo Moster");
  expect(html).toContain("Back to top");
});

test("HomePage renders per-route title and description", () => {
  const html = renderToStaticMarkup(
    createElement(MemoryRouter, { initialEntries: ["/"] }, createElement(App)),
  );

  expect(html).toContain(
    "<title>Jalo Moster — Software Engineer at Chick-fil-A</title>",
  );
  expect(html).toMatch(
    /<meta name="description" content="Personal site of Jalo Moster[^"]*"/,
  );
});

test("AboutPage renders per-route title and description", () => {
  const html = renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: ["/about"] },
      createElement(App),
    ),
  );

  expect(html).toContain("<title>About — Jalo Moster</title>");
  expect(html).toMatch(
    /<meta name="description" content="Sr\. Lead Software Engineer at Chick-fil-A[^"]*"/,
  );
});

test("article detail renders dek, datetime, reading time, and no more-writing nav", () => {
  const html = renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: ["/articles/hello-world"] },
      createElement(App),
    ),
  );

  const text = html.replace(/&#x27;/g, "'");

  expect(text).toContain("Why this site exists and what's coming.");
  expect(html).toMatch(/<time[^>]*dateTime="2026-05-18"/);
  expect(html).toContain("1 min read");
  expect(html).not.toContain("More writing");
});
