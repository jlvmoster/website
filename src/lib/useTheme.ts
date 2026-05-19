import { useCallback, useEffect, useMemo, useState } from "react";

export type ThemeChoice = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

function readChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem("theme");
    return v === "light" || v === "dark" || v === "system" ? v : "system";
  } catch {
    return "system";
  }
}

function systemPrefersDark() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function resolveChoice(
  choice: ThemeChoice,
  prefersDark: boolean,
): ResolvedTheme {
  return choice === "dark" || (choice === "system" && prefersDark)
    ? "dark"
    : "light";
}

function applyChoice(choice: ThemeChoice) {
  const prefersDark = systemPrefersDark();
  const isDark = choice === "dark" || (choice === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", isDark);
}

function persistChoice(choice: ThemeChoice) {
  try {
    localStorage.setItem("theme", choice);
  } catch {}
}

export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>(readChoice);
  const [prefersDark, setPrefersDark] = useState(systemPrefersDark);
  const resolvedTheme = useMemo(
    () => resolveChoice(choice, prefersDark),
    [choice, prefersDark],
  );

  useEffect(() => {
    persistChoice(choice);
    applyChoice(choice);
  }, [choice]);

  const chooseTheme = useCallback((nextChoice: ThemeChoice) => {
    persistChoice(nextChoice);
    applyChoice(nextChoice);
    setChoice(nextChoice);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const systemTheme = mq.matches ? "dark" : "light";
      setPrefersDark(mq.matches);
      if (choice === "system") {
        applyChoice("system");
      } else if (resolvedTheme === systemTheme) {
        persistChoice("system");
        applyChoice("system");
        setChoice("system");
      }
    };
    setPrefersDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [choice, resolvedTheme]);

  return { choice, resolvedTheme, setTheme: chooseTheme } as const;
}
