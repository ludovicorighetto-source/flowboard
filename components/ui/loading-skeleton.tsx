export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-panel bg-black/[0.05] ${className}`} />;
}
