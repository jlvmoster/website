import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { navItems } from "../content/nav";
import { clsx } from "../lib/clsx";
import { ChevronDownIcon, CloseIcon } from "./icons";

export function MobileNavigation({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={clsx(
          className,
          "group flex items-center rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-zinc-800 shadow-lg ring-1 shadow-zinc-800/5 ring-zinc-900/5 backdrop-blur-sm dark:bg-zinc-800/90 dark:text-zinc-200 dark:ring-white/10 dark:hover:ring-white/20",
        )}
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        Menu
        <ChevronDownIcon className="ml-3 h-2 w-2 stroke-zinc-500 group-hover:stroke-zinc-700 dark:group-hover:stroke-zinc-400" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="fixed inset-0 bg-zinc-800/40 backdrop-blur-xs dark:bg-black/80"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-4 top-8 z-50 origin-top rounded-3xl bg-white p-8 ring-1 ring-zinc-900/5 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="flex flex-row-reverse items-center justify-between">
              <button
                type="button"
                aria-label="Close menu"
                className="-m-1 p-1"
                onClick={() => setOpen(false)}
              >
                <CloseIcon className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
              </button>
              <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Navigation
              </h2>
            </div>
            <nav className="mt-6">
              <ul className="-my-2 divide-y divide-zinc-100 text-base text-zinc-800 dark:divide-zinc-100/5 dark:text-zinc-300">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className="block py-2"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
