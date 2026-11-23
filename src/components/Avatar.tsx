import type { ComponentPropsWithoutRef, CSSProperties, Ref } from "react";
import { Link } from "react-router-dom";
import { clsx } from "../lib/clsx";

type AvatarContainerProps = ComponentPropsWithoutRef<"div">;

export function AvatarContainer({ className, ...props }: AvatarContainerProps) {
  return (
    <div
      className={clsx(
        className,
        "h-10 w-10 rounded-full bg-white/90 p-0.5 shadow-lg ring-1 shadow-zinc-800/5 ring-zinc-900/5 backdrop-blur-sm dark:bg-zinc-800/90 dark:ring-white/10",
      )}
      {...props}
    />
  );
}

type AvatarProps = {
  large?: boolean;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLAnchorElement>;
};

export function Avatar({ large = false, className, style, ref }: AvatarProps) {
  return (
    <Link
      ref={ref}
      to="/"
      aria-label="Home"
      className={clsx(className, "pointer-events-auto")}
      style={style}
    >
      <img
        src="/images/avatar.jpg"
        width={large ? 96 : 36}
        height={large ? 96 : 36}
        decoding="async"
        loading="eager"
        fetchPriority="high"
        alt=""
        className={clsx(
          "rounded-full bg-zinc-100 object-contain dark:bg-zinc-800",
          large ? "h-24 w-24" : "h-9 w-9",
        )}
      />
    </Link>
  );
}
