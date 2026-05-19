import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { Link } from "react-router-dom";
import { clsx } from "../lib/clsx";
import { ChevronRightIcon } from "./icons";

type CardProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children?: ReactNode;
};

function isExternal(href: string): boolean {
  return href.startsWith("http") || href.startsWith("mailto:");
}

export function Card<T extends ElementType = "div">({
  as,
  className,
  children,
}: CardProps<T>) {
  const Component = (as ?? "div") as ElementType;
  return (
    <Component
      className={clsx(className, "group relative flex flex-col items-start")}
    >
      {children}
    </Component>
  );
}

type CardLinkProps = ComponentPropsWithoutRef<"a"> & { href: string };

Card.Link = function CardLink({ children, href, ...props }: CardLinkProps) {
  if (isExternal(href)) {
    return (
      <>
        <div className="absolute -inset-x-4 -inset-y-6 z-0 scale-95 bg-zinc-50 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 sm:-inset-x-6 sm:rounded-2xl dark:bg-zinc-800/50" />
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
          <span className="absolute -inset-x-4 -inset-y-6 z-20 sm:-inset-x-6 sm:rounded-2xl" />
          <span className="relative z-10">{children}</span>
        </a>
      </>
    );
  }
  return (
    <>
      <div className="absolute -inset-x-4 -inset-y-6 z-0 scale-95 bg-zinc-50 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 sm:-inset-x-6 sm:rounded-2xl dark:bg-zinc-800/50" />
      <Link to={href} {...props}>
        <span className="absolute -inset-x-4 -inset-y-6 z-20 sm:-inset-x-6 sm:rounded-2xl" />
        <span className="relative z-10">{children}</span>
      </Link>
    </>
  );
};

type CardTitleProps = {
  as?: ElementType;
  href?: string;
  children: ReactNode;
};

Card.Title = function CardTitle({ as, href, children }: CardTitleProps) {
  const Component = (as ?? "h2") as ElementType;
  return (
    <Component className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
      {href ? <Card.Link href={href}>{children}</Card.Link> : children}
    </Component>
  );
};

Card.Description = function CardDescription({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <p className="relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
      {children}
    </p>
  );
};

Card.Cta = function CardCta({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="relative z-10 mt-4 flex items-center text-sm font-medium text-accent"
    >
      {children}
      <ChevronRightIcon className="ml-1 h-4 w-4 stroke-current" />
    </div>
  );
};

type CardEyebrowProps<T extends ElementType> = {
  as?: T;
  dateTime?: string;
  decorate?: boolean;
  className?: string;
  children: ReactNode;
};

Card.Eyebrow = function CardEyebrow<T extends ElementType = "p">({
  as,
  dateTime,
  decorate = false,
  className,
  children,
}: CardEyebrowProps<T>) {
  const Component = (as ?? "p") as ElementType;
  return (
    <Component
      className={clsx(
        className,
        "relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500",
        decorate && "pl-3.5",
      )}
      {...(dateTime ? { dateTime } : {})}
    >
      {decorate && (
        <span
          className="absolute inset-y-0 left-0 flex items-center"
          aria-hidden="true"
        >
          <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
        </span>
      )}
      {children}
    </Component>
  );
};
