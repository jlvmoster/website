import { Link, useParams } from "react-router-dom";
import { ArticleLayout } from "../components/ArticleLayout";
import { Container } from "../components/Container";
import { getArticleBySlug } from "../content/articles";

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;

  if (!article) {
    return (
      <Container className="mt-16 sm:mt-32">
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

  const Body = article.Component;
  return (
    <ArticleLayout article={article}>
      <Body />
    </ArticleLayout>
  );
}
