import { forwardRef, type ReactNode } from "react";
import { clsx } from "../lib/clsx";

type ContainerProps = { children: ReactNode; className?: string };

export const ContainerOuter = forwardRef<HTMLDivElement, ContainerProps>(
  function ContainerOuter({ children, className }, ref) {
    return (
      <div ref={ref} className={clsx("sm:px-8", className)}>
        <div className="mx-auto w-full max-w-7xl lg:px-8">{children}</div>
      </div>
    );
  },
);

export const ContainerInner = forwardRef<HTMLDivElement, ContainerProps>(
  function ContainerInner({ children, className }, ref) {
    return (
      <div
        ref={ref}
        className={clsx("relative px-4 sm:px-8 lg:px-12", className)}
      >
        <div className="mx-auto max-w-2xl lg:max-w-5xl">{children}</div>
      </div>
    );
  },
);

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  function Container({ children, className }, ref) {
    return (
      <ContainerOuter ref={ref} className={className}>
        <ContainerInner>{children}</ContainerInner>
      </ContainerOuter>
    );
  },
);
