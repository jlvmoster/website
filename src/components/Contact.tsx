export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-3xl px-6 py-20">
      <h2 className="mb-6 text-xs font-medium uppercase tracking-[0.18em] text-muted">
        Contact
      </h2>
      <MailtoLink />
    </section>
  );
}

function MailtoLink() {
  return (
    <a
      href="mailto:jalo@moster.dev"
      className="text-fg underline decoration-fg/30 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent/60"
    >
      jalo@moster.dev
    </a>
  );
}
