import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { clsx } from "../lib/clsx";

type ContainerProps = ComponentPropsWithoutRef<"div">;

export const ContainerOuter = forwardRef<HTMLDivElement, ContainerProps>(
  function ContainerOuter({ children, className, ...rest }, ref) {
    return (
      <div ref={ref} className={clsx("sm:px-8", className)} {...rest}>
        <div className="mx-auto w-full max-w-7xl lg:px-8">{children}</div>
      </div>
    );
  },
);

export const ContainerInner = forwardRef<HTMLDivElement, ContainerProps>(
  function ContainerInner({ children, className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={clsx("relative px-4 sm:px-8 lg:px-12", className)}
        {...rest}
      >
        <div className="mx-auto max-w-2xl lg:max-w-5xl">{children}</div>
      </div>
    );
  },
);

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  function Container({ children, className, ...rest }, ref) {
    return (
      <ContainerOuter ref={ref} className={className} {...rest}>
        <ContainerInner>{children}</ContainerInner>
      </ContainerOuter>
    );
  },
);
