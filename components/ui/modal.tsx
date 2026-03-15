"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import { cn } from "@/lib/utils/cn";

export function Modal({
  open,
  onClose,
  title,
  children,
  className
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        className={cn(
          "panel subtle-scrollbar relative z-10 max-h-[90vh] w-full overflow-y-auto",
          className
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-panel border-b border-black/[0.06] bg-white/95 px-5 py-4 backdrop-blur">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button
            type="button"
            className="focus-ring rounded-full p-1 text-muted hover:bg-black/[0.04] hover:text-ink"
            onClick={onClose}
            aria-label="Chiudi"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
