export function Hero() {
  return (
    <section
      id="hero"
      className="mx-auto max-w-3xl px-6 pt-20 pb-24 sm:pt-28 sm:pb-32"
    >
      <h1 className="font-serif text-3xl leading-snug tracking-tight text-fg sm:text-4xl sm:leading-[1.25]">
        Hi, I'm Jalo and I'm a Software Engineer at Chick-fil-A. It's my
        pleasure to invite you into my portfolio.
      </h1>
      <ul className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted">
        <li>
          <a
            href="https://github.com/jlvmoster"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="inline-flex items-center gap-2 transition-colors hover:text-fg focus-visible:text-fg"
          >
            <GitHubIcon />
            <span>GitHub</span>
          </a>
        </li>
        <li>
          <a
            href="https://instagram.com/jlvmoster"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="inline-flex items-center gap-2 transition-colors hover:text-fg focus-visible:text-fg"
          >
            <InstagramIcon />
            <span>Instagram</span>
          </a>
        </li>
        <li>
          <a
            href="https://linkedin.com/in/jlvmoster"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="inline-flex items-center gap-2 transition-colors hover:text-fg focus-visible:text-fg"
          >
            <LinkedInIcon />
            <span>LinkedIn</span>
          </a>
        </li>
      </ul>
    </section>
  );
}

function GitHubIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12c0 4.6 3 8.5 7.2 9.9.5.1.7-.2.7-.5v-1.9c-2.9.6-3.5-1.4-3.5-1.4-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.3-.3-4.7-1.2-4.7-5.1 0-1.1.4-2 1.1-2.8-.1-.3-.5-1.3.1-2.7 0 0 .9-.3 2.9 1.1.8-.2 1.7-.3 2.6-.3.9 0 1.8.1 2.6.3 2-1.4 2.9-1.1 2.9-1.1.6 1.4.2 2.4.1 2.7.7.7 1.1 1.7 1.1 2.8 0 3.9-2.4 4.8-4.7 5.1.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 4.2-1.4 7.2-5.3 7.2-9.9C22.5 6.2 17.8 1.5 12 1.5Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.5 3h-17A.5.5 0 0 0 3 3.5v17a.5.5 0 0 0 .5.5h17a.5.5 0 0 0 .5-.5v-17a.5.5 0 0 0-.5-.5ZM8.3 18.3H5.5V9.8h2.8v8.5ZM6.9 8.6a1.6 1.6 0 1 1 0-3.3 1.6 1.6 0 0 1 0 3.3Zm11.4 9.7h-2.8v-4.1c0-1 0-2.3-1.4-2.3s-1.6 1.1-1.6 2.2v4.2H9.7V9.8h2.7v1.2h.1a3 3 0 0 1 2.7-1.5c2.9 0 3.4 1.9 3.4 4.4v4.4Z" />
    </svg>
  );
}
