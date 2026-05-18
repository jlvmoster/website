import { Container } from "../components/Container";
import { ArticleCard } from "../components/home/ArticleCard";
import { Photos } from "../components/home/Photos";
import { Resume } from "../components/home/Resume";
import { GitHubIcon, InstagramIcon, LinkedInIcon } from "../components/icons";
import { SocialLink } from "../components/SocialLink";
import { getAllArticles } from "../content/articles";

export function HomePage() {
  const articles = getAllArticles().slice(0, 4);
  return (
    <>
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
      <Photos />
      <Container className="mt-24 md:mt-28">
        <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2">
          <div className="flex flex-col gap-16">
            {articles.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                First post coming soon.
              </p>
            ) : (
              articles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))
            )}
          </div>
          <div className="space-y-10 lg:pl-16 xl:pl-24">
            <Resume />
          </div>
        </div>
      </Container>
    </>
  );
}
