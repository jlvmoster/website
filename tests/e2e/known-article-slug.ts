import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const articlesIndex = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../src/content/articles/index.ts",
);

/** First slug key in the articles `modules` record. */
export function knownArticleSlug(): string {
  const source = readFileSync(articlesIndex, "utf8");
  const record = source.match(/const modules\b[\s\S]*?=\s*\{([\s\S]*?)\n\};/);
  const slug = record?.[1]?.match(
    /["']([a-z0-9]+(?:-[a-z0-9]+)*)["']\s*:/,
  )?.[1];
  if (!slug) {
    throw new Error(
      "src/content/articles/index.ts modules record has no slug key",
    );
  }
  return slug;
}

/** `meta.title` of that slug's article module. */
export function knownArticleTitle(slug = knownArticleSlug()): string {
  const source = readFileSync(
    join(dirname(articlesIndex), `${slug}.tsx`),
    "utf8",
  );
  const title = source.match(/title:\s*"([^"]+)"/)?.[1];
  if (!title) {
    throw new Error(`src/content/articles/${slug}.tsx has no meta title`);
  }
  return title;
}
