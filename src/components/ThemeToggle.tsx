import { type ThemeChoice, useTheme } from "../lib/useTheme";
import { MoonIcon, SunIcon } from "./icons";

const nextChoice: Record<ThemeChoice, ThemeChoice> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const labelFor: Record<ThemeChoice, string> = {
  light: "Switch to dark theme",
  dark: "Switch to system theme",
  system: "Switch to light theme",
};

function isCurrentlyDark(choice: ThemeChoice): boolean {
  if (choice === "dark") return true;
  if (choice === "light") return false;
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function ThemeToggle() {
  const [choice, setChoice] = useTheme();
  const dark = isCurrentlyDark(choice);

  return (
    <button
      type="button"
      aria-label={labelFor[choice]}
      className="group rounded-full bg-white/90 px-3 py-2 shadow-lg ring-1 shadow-zinc-800/5 ring-zinc-900/5 backdrop-blur-sm transition dark:bg-zinc-800/90 dark:ring-white/10 dark:hover:ring-white/20"
      onClick={() => setChoice(nextChoice[choice])}
    >
      {dark ? (
        <MoonIcon className="h-6 w-6 fill-zinc-700 stroke-zinc-500 transition group-hover:fill-zinc-600 group-hover:stroke-zinc-700 dark:fill-zinc-200 dark:stroke-zinc-400 dark:group-hover:fill-zinc-100 dark:group-hover:stroke-zinc-300" />
      ) : (
        <SunIcon className="h-6 w-6 transition group-hover:fill-zinc-200 dark:hidden [@media(prefers-color-scheme:dark)]:fill-teal-50 [@media(prefers-color-scheme:dark)]:stroke-teal-500 [@media(prefers-color-scheme:dark)]:group-hover:fill-teal-50 [@media(prefers-color-scheme:dark)]:group-hover:stroke-teal-600" />
      )}
    </button>
  );
}
