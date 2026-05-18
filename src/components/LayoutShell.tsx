import type { ReactNode } from "react";

export function LayoutShell({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="fixed inset-0 flex justify-center sm:px-8">
        <div className="flex w-full max-w-7xl lg:px-8">
          <div className="w-full bg-[var(--panel)] ring-1 ring-[var(--ring)]" />
        </div>
      </div>
      <div className="relative flex w-full flex-col">
        <main className="flex-auto">{children}</main>
      </div>
    </>
  );
}
