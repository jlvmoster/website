import { Link } from "react-router-dom";
import { Container } from "../components/Container";

export function NotFoundPage() {
  return (
    <Container className="mt-16 sm:mt-32">
      <title>Not found — Jalo Moster</title>
      <meta name="description" content="That page doesn't exist." />
      <div className="max-w-xl">
        <p className="text-sm font-medium tracking-wide text-accent">404</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
          Page not found.
        </h1>
        <p className="mt-6 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          That URL doesn't map to anything on this site. Head home and try again
          from there.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex cursor-pointer text-sm font-medium text-zinc-800 transition-colors duration-200 ease-out hover:text-accent focus-visible:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:text-zinc-200"
        >
          Return home
          <span aria-hidden="true" className="ml-1">
            →
          </span>
        </Link>
      </div>
    </Container>
  );
}
