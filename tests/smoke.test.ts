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

  for (const url of [
    "https://github.com/jlvmoster",
    "https://instagram.com/jlvmoster",
    "https://linkedin.com/in/jlvmoster",
  ]) {
    expect(html).toContain(url);
  }
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
