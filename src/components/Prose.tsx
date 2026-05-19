import type { ReactNode } from "react";
import { clsx } from "../lib/clsx";

type ProseProps = {
  children: ReactNode;
  className?: string;
};

export function Prose({ children, className }: ProseProps) {
  return (
    <div className={clsx("prose dark:prose-invert", className)}>{children}</div>
  );
}
