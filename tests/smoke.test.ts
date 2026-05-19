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
