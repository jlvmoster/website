import { useCallback, useEffect, useState } from "react";

export type ThemeChoice = "light" | "dark" | "system";

function readChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem("theme");
    return v === "light" || v === "dark" || v === "system" ? v : "system";
  } catch {
    return "system";
  }
}

function applyChoice(choice: ThemeChoice) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
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
  const [, forceRender] = useState(0);

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
      if (choice === "system") {
        applyChoice("system");
        forceRender((n) => n + 1);
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [choice]);

  return [choice, chooseTheme] as const;
}
