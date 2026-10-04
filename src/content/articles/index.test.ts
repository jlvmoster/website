import { expect, test } from "bun:test";
import {
  type ArticleWithSlug,
  getAdjacentArticles,
  getAllArticles,
} from "./index";

function stub(slug: string, date: string): ArticleWithSlug {
  return {
    slug,
    title: slug,
    description: slug,
    date,
    Component: () => null,
  };
}

test("getAllArticles returns at least the hello-world placeholder", () => {
  const articles = getAllArticles();
  expect(articles.length).toBeGreaterThanOrEqual(1);
  expect(articles.some((article) => article.slug === "hello-world")).toBe(true);
});

test("getAdjacentArticles hides neighbors when only one article exists", () => {
  expect(
    getAdjacentArticles("hello-world", [stub("hello-world", "2026-05-18")]),
  ).toEqual({});
});

test("getAdjacentArticles returns previous and next by date-desc order", () => {
  const articles = [
    stub("newest", "2026-06-01"),
    stub("middle", "2026-05-18"),
    stub("oldest", "2026-01-01"),
  ];

  expect(getAdjacentArticles("newest", articles)).toEqual({
    next: undefined,
    previous: articles[1],
  });
  expect(getAdjacentArticles("middle", articles)).toEqual({
    next: articles[0],
    previous: articles[2],
  });
  expect(getAdjacentArticles("oldest", articles)).toEqual({
    next: articles[1],
    previous: undefined,
  });
});
