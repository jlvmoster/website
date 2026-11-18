import { expect, test } from "bun:test";
import { readingTimeMinutes } from "./readingTime";

test("blank text is still 1 min", () => {
  expect(readingTimeMinutes("")).toBe(1);
  expect(readingTimeMinutes("   ")).toBe(1);
});

test("ceil-divides whitespace-separated tokens by 200", () => {
  expect(readingTimeMinutes("one two three four five")).toBe(1);
  const words = Array.from({ length: 201 }, (_, i) => `w${i}`).join(" ");
  expect(readingTimeMinutes(words)).toBe(2);
  const tags = Array.from({ length: 201 }, () => "<p>").join(" ");
  expect(readingTimeMinutes(tags)).toBe(2);
});

test("does not pull react-dom/server", async () => {
  const src = await Bun.file(
    new URL("./readingTime.ts", import.meta.url),
  ).text();
  expect(src).not.toContain("react-dom");
  expect(src).not.toContain("ComponentType");
});
