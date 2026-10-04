import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Link, MemoryRouter, Route, Routes, useParams } from "react-router-dom";
import { readingTimeMinutes } from "../lib/readingTime";
import { ArticleLayout } from "./ArticleLayout";

function RouterPost() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <p>
      <Link to="/articles">Linked {slug}</Link>
    </p>
  );
}

test("article body may use Link and useParams without throwing", () => {
  const html = renderToStaticMarkup(
    <MemoryRouter initialEntries={["/articles/hello-world"]}>
      <Routes>
        <Route
          path="/articles/:slug"
          element={
            <ArticleLayout
              article={{
                title: "Hello, world",
                description: "Why this site exists and what's coming.",
                date: "2026-05-18",
              }}
              readingMinutes={readingTimeMinutes(
                "Why this site exists and what's coming.",
              )}
            >
              <RouterPost />
            </ArticleLayout>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

  expect(html).toContain("Linked hello-world");
  expect(html).toContain("1 min read");
});
