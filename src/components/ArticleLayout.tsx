import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { ArticleWithSlug } from "../content/articles";
import { formatDate } from "../lib/formatDate";
import { Card } from "./Card";
import { Container } from "./Container";
import { ArrowLeftIcon } from "./icons";
import { Prose } from "./Prose";

type ArticleLayoutProps = {
  article: { title: string; description: string; date: string };
  readingMinutes: number;
  previous?: ArticleWithSlug;
  next?: ArticleWithSlug;
  children: ReactNode;
};

export function ArticleLayout({
  article,
  readingMinutes,
  previous,
  next,
  children,
}: ArticleLayoutProps) {
  const navigate = useNavigate();
  const hasMore = Boolean(previous || next);

  function goBack() {
    navigate("/articles");
  }

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="xl:relative">
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            onClick={goBack}
            aria-label="Go back to articles"
            className="group mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md ring-1 shadow-zinc-800/5 ring-zinc-900/5 transition lg:absolute lg:-left-5 lg:-mt-2 lg:mb-0 xl:-top-1.5 xl:left-0 xl:mt-0 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20"
          >
            <ArrowLeftIcon className="h-4 w-4 stroke-zinc-500 transition group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400" />
          </button>
          <article>
            <header className="flex flex-col">
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
                {article.title}
              </h1>
              <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
                {article.description}
              </p>
              <div className="order-first flex items-center text-base text-zinc-400 dark:text-zinc-500">
                <time dateTime={article.date} className="flex items-center">
                  <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
                  <span className="ml-3">{formatDate(article.date)}</span>
                </time>
                <span className="mx-3" aria-hidden="true">
                  ·
                </span>
                <span>{readingMinutes} min read</span>
              </div>
            </header>
            <Prose className="mt-8">{children}</Prose>
          </article>
          {hasMore ? (
            <nav aria-labelledby="more-writing-heading" className="mt-16">
              <h2
                id="more-writing-heading"
                className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
              >
                More writing
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
                {next ? <RelatedArticle label="Next" article={next} /> : null}
                {previous ? (
                  <RelatedArticle label="Previous" article={previous} />
                ) : null}
              </div>
            </nav>
          ) : null}
        </div>
      </div>
    </Container>
  );
}

function RelatedArticle({
  label,
  article,
}: {
  label: string;
  article: ArticleWithSlug;
}) {
  return (
    <Card>
      <Card.Eyebrow>{label}</Card.Eyebrow>
      <Card.Title as="h3" href={`/articles/${article.slug}`}>
        {article.title}
      </Card.Title>
      <Card.Description>{article.description}</Card.Description>
      <Card.Cta>Read article</Card.Cta>
    </Card>
  );
}
