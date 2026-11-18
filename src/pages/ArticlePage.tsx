import { isValidElement, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArticleLayout } from "../components/ArticleLayout";
import { Container } from "../components/Container";
import { getAdjacentArticles, getArticleBySlug } from "../content/articles";
import { readingTimeMinutes } from "../lib/readingTime";

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join(" ");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return textOf(node.props.children);
  }
  return "";
}

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;

  if (!article) {
    return (
      <Container className="mt-16 sm:mt-32">
        <title>Article not found — Jalo Moster</title>
        <meta name="description" content="That article does not exist (yet)." />
        <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
          Article not found.
        </h1>
        <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
          That article does not exist (yet).{" "}
          <Link
            to="/articles"
            className="text-accent transition hover:opacity-80"
          >
            Back to all articles
          </Link>
          .
        </p>
      </Container>
    );
  }

  const Body = article.Component as () => ReactNode;
  const { previous, next } = getAdjacentArticles(article.slug);
  // shortcut: articles are hook-free functions, call one to read its text; switch to a text export if an article uses hooks
  const body = Body();
  const readingMinutes = readingTimeMinutes(textOf(body));
  return (
    <ArticleLayout
      article={article}
      readingMinutes={readingMinutes}
      previous={previous}
      next={next}
    >
      <title>{`${article.title} — Jalo Moster`}</title>
      <meta name="description" content={article.description} />
      {body}
    </ArticleLayout>
  );
}
