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
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      aria-label={
        ariaLabel ?? (typeof children === "string" ? children : undefined)
      }
      className="group -m-1 cursor-pointer rounded-md p-1 transition-transform duration-200 ease-out active:scale-95 motion-reduce:active:scale-100"
    >
      <Icon className="h-6 w-6 fill-zinc-500 text-zinc-500 transition-[fill,color] duration-200 ease-out group-hover:fill-accent group-hover:text-accent group-focus-visible:fill-accent group-focus-visible:text-accent dark:fill-zinc-400 dark:text-zinc-400" />
    </a>
  );
}
