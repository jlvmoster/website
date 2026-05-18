import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { clsx } from "../lib/clsx";
import { Avatar, AvatarContainer } from "./Avatar";
import { ContainerInner } from "./Container";
import { MobileNavigation } from "./MobileNavigation";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { label: "About", href: "/about" },
  { label: "Articles", href: "/articles" },
  { label: "Projects", href: "/projects" },
  { label: "Uses", href: "/uses" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const { pathname } = useLocation();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <li>
      <Link
        to={href}
        className={clsx(
          "relative block px-3 py-2 transition",
          active
            ? "text-teal-500 dark:text-teal-400"
            : "hover:text-teal-500 dark:hover:text-teal-400",
        )}
      >
        {label}
        {active ? (
          <span className="absolute inset-x-1 -bottom-px h-px bg-linear-to-r from-teal-500/0 via-teal-500/40 to-teal-500/0 dark:from-teal-400/0 dark:via-teal-400/40 dark:to-teal-400/0" />
        ) : null}
      </Link>
    </li>
  );
}

function DesktopNav() {
  return (
    <nav className="pointer-events-auto hidden md:block">
      <ul className="flex rounded-full bg-white/90 px-3 text-sm font-medium text-zinc-800 shadow-lg ring-1 shadow-zinc-800/5 ring-zinc-900/5 backdrop-blur-sm dark:bg-zinc-800/90 dark:text-zinc-200 dark:ring-white/10">
        {navItems.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} />
        ))}
      </ul>
    </nav>
  );
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export function Header() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  useEffect(() => {
    const root = document.documentElement;
    if (!isHome) {
      root.style.removeProperty("--avatar-image-transform");
      return;
    }

    const fromScale = 1;
    const toScale = 36 / 64;
    const downDelay = 256;

    function update() {
      const scrollY = clamp(window.scrollY, 0, downDelay);
      const scale = fromScale + (toScale - fromScale) * (scrollY / downDelay);
      root.style.setProperty(
        "--avatar-image-transform",
        `translate3d(0, 0, 0) scale(${scale})`,
      );
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isHome]);

  return (
    <header className="pointer-events-none relative z-50 flex flex-none flex-col">
      {isHome ? (
        <div className="order-last mt-16 pt-6">
          <ContainerInner className="w-full">
            <div className="relative origin-left">
              <Avatar large className="block origin-left" />
            </div>
          </ContainerInner>
        </div>
      ) : null}
      <div className="top-0 z-10 h-16 pt-6">
        <ContainerInner className="w-full">
          <div className="relative flex gap-4">
            <div className="flex flex-1">
              {!isHome ? (
                <AvatarContainer className="pointer-events-auto">
                  <Avatar />
                </AvatarContainer>
              ) : null}
            </div>
            <div className="flex flex-1 justify-end md:justify-center">
              <MobileNavigation />
              <DesktopNav />
            </div>
            <div className="flex justify-end md:flex-1">
              <div className="pointer-events-auto">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </ContainerInner>
      </div>
    </header>
  );
}
