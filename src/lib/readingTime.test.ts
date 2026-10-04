import { expect, test } from "bun:test";
import { readingTimeMinutes } from "./readingTime";

test("empty markup is still 1 min", () => {
  expect(readingTimeMinutes("")).toBe(1);
  expect(readingTimeMinutes("   ")).toBe(1);
  expect(readingTimeMinutes("<p></p>")).toBe(1);
});

test("strips tags then ceil-divides by 200", () => {
  expect(readingTimeMinutes("<p>one two three four five</p>")).toBe(1);
  const words = Array.from({ length: 201 }, (_, i) => `w${i}`).join(" ");
  expect(readingTimeMinutes(`<p>${words}</p>`)).toBe(2);
});

test("does not pull react-dom/server", async () => {
  const src = await Bun.file(
    new URL("./readingTime.ts", import.meta.url),
  ).text();
  expect(src).not.toContain("react-dom");
  expect(src).not.toContain("ComponentType");
});
