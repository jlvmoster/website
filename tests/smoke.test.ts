import { expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { App } from "../src/App";

test("App renders without throwing and contains the canonical hero copy + section IDs in order", () => {
  const html = renderToStaticMarkup(createElement(App));
  const text = html.replace(/&#x27;/g, "'");

  expect(text).toContain("It's my pleasure to invite you into my portfolio.");

  const order = ["hero", "writing", "about", "contact"].map((id) =>
    html.indexOf(`id="${id}"`),
  );
  expect(order.every((i) => i >= 0)).toBe(true);
  expect(order).toEqual([...order].sort((a, b) => a - b));

  for (const url of [
    "https://github.com/jlvmoster",
    "https://instagram.com/jlvmoster",
    "https://linkedin.com/in/jlvmoster",
  ]) {
    expect(html).toContain(url);
  }
});
