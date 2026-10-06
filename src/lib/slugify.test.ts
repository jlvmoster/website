import { expect, test } from "bun:test";
import { slugify } from "./slugify";

test("slugify turns categories into kebab-case anchors", () => {
  expect(slugify("Workstation")).toBe("workstation");
  expect(slugify("Development tools")).toBe("development-tools");
  expect(slugify("  Productivity  ")).toBe("productivity");
});
