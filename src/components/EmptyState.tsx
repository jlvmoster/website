type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 px-6 py-10 dark:border-zinc-700/60">
      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
        {title}
      </p>
      <p className="mt-2 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}
