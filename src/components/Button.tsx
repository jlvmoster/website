import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Link } from "react-router-dom";
import { clsx } from "../lib/clsx";

type Variant = "primary" | "secondary";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-zinc-800 font-semibold text-zinc-100 hover:bg-zinc-700 active:bg-zinc-800 active:text-zinc-100/70 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:active:bg-zinc-700 dark:active:text-zinc-100/70",
  secondary:
    "bg-zinc-50 font-medium text-zinc-900 hover:bg-zinc-100 active:bg-zinc-100 active:text-zinc-900/60 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:active:bg-zinc-800/50 dark:active:text-zinc-50/70",
};

type CommonProps = {
  variant?: Variant;
  className?: string;
  children?: ReactNode;
};

type AnchorButtonProps = CommonProps &
  Omit<ComponentPropsWithoutRef<"a">, "href" | keyof CommonProps> & {
    href: string;
  };

type NativeButtonProps = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof CommonProps> & {
    href?: undefined;
  };

export function Button(props: AnchorButtonProps | NativeButtonProps) {
  const { variant = "primary", className, children, ...rest } = props;
  const classes = clsx(
    "inline-flex items-center gap-2 justify-center rounded-md py-2 px-3 text-sm outline-offset-2 transition active:transition-none",
    variantStyles[variant],
    className,
  );

  if (typeof rest.href === "string") {
    const { href, ...anchorRest } = rest as AnchorButtonProps;
    if (
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("/cv")
    ) {
      return (
        <a href={href} className={classes} {...anchorRest}>
          {children}
        </a>
      );
    }
    return (
      <Link to={href} className={classes} {...anchorRest}>
        {children}
      </Link>
    );
  }
  const { href: _omit, ...buttonRest } = rest as NativeButtonProps;
  return (
    <button type="button" className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
