import { expect, test } from "bun:test";
import { readingTimeMinutes, textFromHtml } from "./readingTime";

test("empty text is still 1 min", () => {
  expect(readingTimeMinutes("")).toBe(1);
  expect(readingTimeMinutes("   ")).toBe(1);
});

test("short copy rounds up to 1 min", () => {
  expect(readingTimeMinutes("one two three four five")).toBe(1);
});

test("ceil-divides by 200 words per minute", () => {
  const words = Array.from({ length: 201 }, (_, i) => `w${i}`).join(" ");
  expect(readingTimeMinutes(words)).toBe(2);
});

test("textFromHtml strips tags", () => {
  expect(textFromHtml("<p>Hello, <em>world</em>.</p>")).toBe("Hello, world.");
});
