import type { ComponentType } from "react";
import * as helloWorld from "./hello-world";

export type ArticleMeta = {
  title: string;
  description: string;
  date: string;
  author?: string;
};

export type ArticleWithSlug = ArticleMeta & {
  slug: string;
  Component: ComponentType;
};

const modules: Record<string, { meta: ArticleMeta; default: ComponentType }> = {
  "hello-world": helloWorld,
};

export function getAllArticles(): ArticleWithSlug[] {
  return Object.entries(modules)
    .map(([slug, m]) => ({ slug, Component: m.default, ...m.meta }))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getArticleBySlug(slug: string): ArticleWithSlug | undefined {
  return getAllArticles().find((a) => a.slug === slug);
}
