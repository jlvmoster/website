import type { ComponentPropsWithoutRef } from "react";
import { clsx } from "../lib/clsx";

type ContainerProps = ComponentPropsWithoutRef<"div">;

export function ContainerOuter({
  children,
  className,
  ...rest
}: ContainerProps) {
  return (
    <div className={clsx("sm:px-8", className)} {...rest}>
      <div className="mx-auto w-full max-w-7xl lg:px-8">{children}</div>
    </div>
  );
}

export function ContainerInner({
  children,
  className,
  ...rest
}: ContainerProps) {
  return (
    <div
      className={clsx("relative px-4 sm:px-8 lg:px-12", className)}
      {...rest}
    >
      <div className="mx-auto max-w-2xl lg:max-w-5xl">{children}</div>
    </div>
  );
}

export function Container({ children, className, ...rest }: ContainerProps) {
  return (
    <ContainerOuter className={className} {...rest}>
      <ContainerInner>{children}</ContainerInner>
    </ContainerOuter>
  );
}
