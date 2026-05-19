import { type ThemeChoice, useTheme } from "../lib/useTheme";
import { MoonIcon, SunIcon } from "./icons";

function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function isCurrentlyDark(choice: ThemeChoice): boolean {
  if (choice === "dark") return true;
  if (choice === "light") return false;
  return systemPrefersDark();
}

function nextChoice(choice: ThemeChoice): ThemeChoice {
  if (choice === "light") return "dark";
  if (choice === "dark") return "system";
  return "light";
}

function labelFor(choice: ThemeChoice): string {
  const next = nextChoice(choice);
  if (next === "dark") return "Switch to dark theme";
  if (next === "light") return "Switch to light theme";
  return "Switch to system theme";
}

export function ThemeToggle() {
  const [choice, setChoice] = useTheme();
  const dark = isCurrentlyDark(choice);
  const next = nextChoice(choice);

  return (
    <button
      type="button"
      aria-label={labelFor(choice)}
      className="group rounded-full bg-white/90 px-3 py-2 shadow-lg ring-1 shadow-zinc-800/5 ring-zinc-900/5 backdrop-blur-sm transition dark:bg-zinc-800/90 dark:ring-white/10 dark:hover:ring-white/20"
      onClick={() => setChoice(next)}
    >
      {dark ? (
        <MoonIcon className="h-6 w-6 fill-zinc-700 stroke-zinc-500 transition group-hover:fill-zinc-600 group-hover:stroke-zinc-700 dark:fill-zinc-200 dark:stroke-zinc-400 dark:group-hover:fill-zinc-100 dark:group-hover:stroke-zinc-300" />
      ) : (
        <SunIcon className="h-6 w-6 transition group-hover:fill-zinc-200 dark:hidden [@media(prefers-color-scheme:dark)]:fill-red-50 [@media(prefers-color-scheme:dark)]:stroke-accent [@media(prefers-color-scheme:dark)]:group-hover:fill-red-50 [@media(prefers-color-scheme:dark)]:group-hover:stroke-accent" />
      )}
    </button>
  );
}
