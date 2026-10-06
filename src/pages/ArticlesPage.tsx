import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { SimpleLayout } from "../components/SimpleLayout";
import { type ArticleWithSlug, getAllArticles } from "../content/articles";
import { formatDate } from "../lib/formatDate";

function Article({ article }: { article: ArticleWithSlug }) {
  return (
    <article className="md:grid md:grid-cols-4 md:items-baseline">
      <Card className="md:col-span-3">
        <Card.Title href={`/articles/${article.slug}`}>
          {article.title}
        </Card.Title>
        <Card.Eyebrow
          as="time"
          dateTime={article.date}
          className="md:hidden"
          decorate
          tone="accent"
        >
          {formatDate(article.date)}
        </Card.Eyebrow>
        <Card.Description>{article.description}</Card.Description>
        <Card.Cta>Read article</Card.Cta>
      </Card>
      <Card.Eyebrow
        as="time"
        dateTime={article.date}
        className="mt-1 hidden md:block"
        tone="accent"
      >
        {formatDate(article.date)}
      </Card.Eyebrow>
    </article>
  );
}

export function ArticlesPage() {
  const articles = getAllArticles();
  return (
    <SimpleLayout
      title="Notes on data systems, tooling, and the occasional latte."
      intro="A growing collection of write-ups on the work I do at Chick-fil-A, the tools I rely on, and the side projects that catch my attention."
    >
      <title>Articles — Jalo Moster</title>
      <meta
        name="description"
        content="Notes on data systems, tooling, and the occasional latte — write-ups on the work I do at Chick-fil-A and the side projects that catch my attention."
      />
      <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
        <div className="flex max-w-3xl flex-col space-y-12">
          {articles.length === 0 ? (
            <EmptyState
              title="First post coming soon"
              description="Notes on data systems and tooling will land here as they ship."
            />
          ) : (
            articles.map((article) => (
              <Article key={article.slug} article={article} />
            ))
          )}
        </div>
      </div>
    </SimpleLayout>
  );
}
