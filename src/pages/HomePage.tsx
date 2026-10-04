import { Link } from "react-router-dom";
import { Container } from "../components/Container";
import { EmptyState } from "../components/EmptyState";
import { ArticleCard } from "../components/home/ArticleCard";
import { Resume } from "../components/home/Resume";
import { GitHubIcon, InstagramIcon, LinkedInIcon } from "../components/icons";
import { SocialLink } from "../components/SocialLink";
import { getAllArticles } from "../content/articles";

export function HomePage() {
  const articles = getAllArticles().slice(0, 4);
  return (
    <>
      <title>Jalo Moster — Software Engineer at Chick-fil-A</title>
      <meta
        name="description"
        content="Personal site of Jalo Moster — Software Engineer at Chick-fil-A. Notes on data systems, projects, and the tools I use day to day."
      />
      <Container className="mt-9">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
            Software engineer building data systems at Chick-fil-A.
          </h1>
          <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            Hi, I'm Jalo and I'm a Software Engineer at Chick-fil-A. It's my
            pleasure to invite you into my portfolio.
          </p>
          <div className="mt-6 flex gap-6">
            <SocialLink
              href="https://github.com/jlvmoster"
              icon={GitHubIcon}
              aria-label="Follow on GitHub"
            />
            <SocialLink
              href="https://instagram.com/jlvmoster"
              icon={InstagramIcon}
              aria-label="Follow on Instagram"
            />
            <SocialLink
              href="https://linkedin.com/in/jlvmoster"
              icon={LinkedInIcon}
              aria-label="Follow on LinkedIn"
            />
          </div>
        </div>
      </Container>
      <Container className="mt-24 md:mt-28">
        <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2">
          <div className="flex flex-col">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                Writing
              </h2>
              <Link
                to="/articles"
                className="text-sm font-medium text-zinc-600 transition hover:text-accent focus-visible:text-accent dark:text-zinc-400"
              >
                View all
              </Link>
            </div>
            <div className="mt-8 flex flex-col gap-16">
              {articles.length === 0 ? (
                <EmptyState
                  title="First post coming soon"
                  description="Write-ups will show up here as soon as the first one ships."
                />
              ) : (
                articles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))
              )}
            </div>
          </div>
          <div className="space-y-10 lg:pl-16 xl:pl-24">
            <Resume />
          </div>
        </div>
      </Container>
    </>
  );
}
