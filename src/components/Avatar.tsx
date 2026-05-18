import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { Link } from "react-router-dom";
import { clsx } from "../lib/clsx";

type AvatarContainerProps = ComponentPropsWithoutRef<"div">;

export const AvatarContainer = forwardRef<HTMLDivElement, AvatarContainerProps>(
  function AvatarContainer({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(
          className,
          "h-10 w-10 rounded-full bg-white/90 p-0.5 shadow-lg ring-1 shadow-zinc-800/5 ring-zinc-900/5 backdrop-blur-sm dark:bg-zinc-800/90 dark:ring-white/10",
        )}
        {...props}
      />
    );
  },
);

type AvatarProps = {
  large?: boolean;
  className?: string;
};

export const Avatar = forwardRef<HTMLAnchorElement, AvatarProps>(
  function Avatar({ large = false, className }, ref) {
    return (
      <Link
        ref={ref}
        to="/"
        aria-label="Home"
        className={clsx(className, "pointer-events-auto")}
      >
        <img
          src="/images/avatar.jpg"
          alt=""
          className={clsx(
            "rounded-full bg-zinc-100 object-cover dark:bg-zinc-800",
            large ? "h-16 w-16" : "h-9 w-9",
          )}
          style={{ transform: "var(--avatar-image-transform)" }}
        />
      </Link>
    );
  },
);
