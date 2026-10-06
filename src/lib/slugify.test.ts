import { expect, test } from "bun:test";
import { slugify } from "./slugify";

test("slugify turns categories into kebab-case anchors", () => {
  expect(slugify("Workstation")).toBe("workstation");
  expect(slugify("AI tools")).toBe("ai-tools");
  expect(slugify("  Skills & plugins  ")).toBe("skills-plugins");
});
