import type { ComponentType, ReactNode } from "react";

type SocialLinkProps = {
  href: string;
  icon: ComponentType<{ className?: string }>;
  children?: ReactNode;
  "aria-label"?: string;
};

export function SocialLink({
  href,
  icon: Icon,
  children,
  "aria-label": ariaLabel,
}: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={
        ariaLabel ?? (typeof children === "string" ? children : undefined)
      }
      className="group -m-1 p-1"
    >
      <Icon className="h-6 w-6 fill-zinc-500 transition duration-200 group-hover:fill-accent group-focus-visible:fill-accent dark:fill-zinc-400" />
    </a>
  );
}
