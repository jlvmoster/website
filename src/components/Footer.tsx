import { Link, useLocation } from "react-router-dom";
import { navItems } from "../content/nav";
import { clsx } from "../lib/clsx";
import { ContainerInner, ContainerOuter } from "./Container";

export function Footer() {
  const { pathname } = useLocation();
  return (
    <footer className="mt-32 flex-none">
      <ContainerOuter>
        <div className="border-t border-zinc-100 pt-10 pb-16 dark:border-zinc-700/40">
          <ContainerInner>
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {navItems.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={clsx(
                        "transition",
                        active ? "text-accent" : "hover:text-accent",
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                © {new Date().getFullYear()} Jalo Moster. All rights reserved.
              </p>
            </div>
          </ContainerInner>
        </div>
      </ContainerOuter>
    </footer>
  );
}
