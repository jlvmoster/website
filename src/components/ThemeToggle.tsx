import { useEffect, useState } from "react";
import { type ResolvedTheme, useTheme } from "../lib/useTheme";
import { MoonIcon, SunIcon } from "./icons";

function otherTheme(theme: ResolvedTheme): ResolvedTheme {
  return theme === "dark" ? "light" : "dark";
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const nextTheme = otherTheme(resolvedTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      type="button"
      aria-label={mounted ? `Switch to ${nextTheme} theme` : "Toggle theme"}
      className="group rounded-full bg-white/90 px-3 py-2 shadow-lg ring-1 shadow-zinc-800/5 ring-zinc-900/5 backdrop-blur-sm transition dark:bg-zinc-800/90 dark:ring-white/10 dark:hover:ring-white/20"
      onClick={() => setTheme(nextTheme)}
    >
      <SunIcon className="h-6 w-6 fill-zinc-100 stroke-zinc-500 transition group-hover:fill-zinc-200 group-hover:stroke-zinc-700 dark:hidden [@media(prefers-color-scheme:dark)]:fill-red-50 [@media(prefers-color-scheme:dark)]:stroke-accent [@media(prefers-color-scheme:dark)]:group-hover:fill-red-50 [@media(prefers-color-scheme:dark)]:group-hover:stroke-accent" />
      <MoonIcon className="hidden h-6 w-6 fill-zinc-700 stroke-zinc-500 transition not-[@media_(prefers-color-scheme:dark)]:fill-accent/10 not-[@media_(prefers-color-scheme:dark)]:stroke-accent dark:block [@media(prefers-color-scheme:dark)]:group-hover:stroke-zinc-400" />
    </button>
  );
}
