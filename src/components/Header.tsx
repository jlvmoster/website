import { useLayoutEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { navItems } from "../content/nav";
import { clsx } from "../lib/clsx";
import { Avatar, AvatarContainer } from "./Avatar";
import { ContainerInner, ContainerOuter } from "./Container";
import { MobileNavigation } from "./MobileNavigation";
import { ThemeToggle } from "./ThemeToggle";

const avatarDockDistance = 136;
const navHideDistance = 64;
const homeNavHideStart = avatarDockDistance;
const pageNavHideStart = 64;

function NavLink({ href, label }: { href: string; label: string }) {
  const { pathname } = useLocation();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <li>
      <Link
        to={href}
        className={clsx(
          "relative block px-3 py-2 transition",
          active ? "text-accent" : "hover:text-accent",
        )}
      >
        {label}
        {active ? (
          <span className="absolute inset-x-1 -bottom-px h-px bg-linear-to-r from-accent/0 via-accent/40 to-accent/0" />
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
  const homeAvatarRef = useRef<HTMLAnchorElement>(null);
  const homeAvatarSlotRef = useRef<HTMLDivElement>(null);
  const navAvatarSlotRef = useRef<HTMLDivElement>(null);
  const navShellRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const navShell = navShellRef.current;
    if (!navShell) return;

    function update() {
      const navShell = navShellRef.current;
      if (!navShell) return;

      const hideDistance = clamp(
        window.scrollY - (isHome ? homeNavHideStart : pageNavHideStart),
        0,
        navHideDistance,
      );
      navShell.style.transform = `translate3d(0, ${-hideDistance}px, 0)`;

      if (!isHome) return;

      const avatar = homeAvatarRef.current;
      const homeSlot = homeAvatarSlotRef.current;
      const navSlot = navAvatarSlotRef.current;
      if (!avatar || !homeSlot || !navSlot) return;

      const dockScrollY = clamp(window.scrollY, 0, avatarDockDistance);
      const dockProgress = dockScrollY / avatarDockDistance;

      const homeRect = homeSlot.getBoundingClientRect();
      const navRect = navSlot.getBoundingClientRect();
      const startTop = homeRect.top;
      const startLeft = homeRect.left;
      const targetTop = navRect.top + 2;
      const targetLeft = navRect.left + 2;
      const top = startTop + (targetTop - startTop) * dockProgress;
      const left = startLeft + (targetLeft - startLeft) * dockProgress;
      const scale = 1 + (36 / 64 - 1) * dockProgress;

      avatar.style.opacity = "1";
      avatar.style.left = `${left}px`;
      avatar.style.top = `${top}px`;
      avatar.style.transform = `translate3d(0, 0, 0) scale(${scale})`;
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
      <div
        ref={navShellRef}
        className="fixed inset-x-0 top-0 z-10 h-16 pt-6 will-change-transform"
      >
        <ContainerOuter>
          <ContainerInner className="w-full">
            <div className="relative flex gap-4">
              <div className="flex flex-1">
                {isHome ? (
                  <div
                    ref={navAvatarSlotRef}
                    className="h-10 w-10"
                    aria-hidden="true"
                  />
                ) : (
                  <AvatarContainer className="pointer-events-auto">
                    <Avatar />
                  </AvatarContainer>
                )}
              </div>
              <div className="flex flex-1 justify-end md:justify-center">
                <div className="pointer-events-auto md:hidden">
                  <MobileNavigation />
                </div>
                <DesktopNav />
              </div>
              <div className="flex justify-end md:flex-1">
                <div className="pointer-events-auto">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </ContainerInner>
        </ContainerOuter>
      </div>
      <div className="h-16" />
      {isHome ? (
        <div className="mt-16 pt-6">
          <ContainerOuter>
            <ContainerInner className="w-full">
              <div
                ref={homeAvatarSlotRef}
                className="relative h-16 w-16 origin-left"
              >
                <Avatar
                  ref={homeAvatarRef}
                  large
                  className="fixed z-20 block origin-top-left will-change-transform"
                  style={{ opacity: 0 }}
                />
              </div>
            </ContainerInner>
          </ContainerOuter>
        </div>
      ) : null}
    </header>
  );
}
