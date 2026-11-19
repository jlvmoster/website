import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const articlesDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../src/content/articles",
);

/** `meta.title` of an article module. */
export function knownArticleTitle(slug: string): string {
  const source = readFileSync(join(articlesDir, `${slug}.tsx`), "utf8");
  const title = source.match(/title:\s*"([^"]+)"/)?.[1];
  if (!title) {
    throw new Error(`src/content/articles/${slug}.tsx has no meta title`);
  }
  return title;
}
