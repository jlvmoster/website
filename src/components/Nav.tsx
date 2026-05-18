export function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-bg border-b border-fg/10">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-6 overflow-x-auto whitespace-nowrap px-6">
        <a
          href="#hero"
          className="text-base font-medium tracking-tight text-fg transition-colors hover:text-accent"
        >
          Jalo
        </a>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <a
            href="#writing"
            className="transition-colors hover:text-fg focus-visible:text-fg"
          >
            Writing
          </a>
          <a
            href="#about"
            className="transition-colors hover:text-fg focus-visible:text-fg"
          >
            About
          </a>
          <a
            href="#contact"
            className="transition-colors hover:text-fg focus-visible:text-fg"
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
