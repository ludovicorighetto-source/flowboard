import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="panel flex min-h-[220px] flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="max-w-md space-y-2">
        <h3 className="text-xl font-semibold text-ink">{title}</h3>
        <p className="text-sm leading-6 text-muted">{description}</p>
      </div>
      {actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
    </div>
  );
}
