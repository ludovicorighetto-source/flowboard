"use client";

import { Menu } from "lucide-react";
import { useWorkspaceContext } from "@/components/layout/workspace-context";

export function AppHeader({
  title,
  description,
  actions,
  userLabel = "U"
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
  userLabel?: string;
}) {
  const { activeWorkspace } = useWorkspaceContext();

  return (
    <div className="mb-4 lg:mb-6">
      <div className="panel sticky top-0 z-20 mb-4 flex min-h-14 items-center justify-between px-3 py-2 lg:hidden">
        <button
          type="button"
          className="focus-ring inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-ink"
          aria-label="Apri menu"
          onClick={() => window.dispatchEvent(new Event("flowboard:open-nav"))}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0 text-center leading-tight">
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            FlowBoard
          </p>
          <p className="truncate text-[11px] text-muted">Workspace</p>
          <p className="truncate text-xs font-semibold text-ink">
            {activeWorkspace?.name || "Workspace principale"}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-sm font-semibold text-action">
          {userLabel}
        </div>
      </div>

      <div className="hidden flex-col gap-4 lg:flex lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">FlowBoard</p>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Workspace</p>
          <p className="text-sm font-semibold text-ink">
            {activeWorkspace?.name || "Workspace principale"}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">{title}</h2>
          <p className="text-sm leading-6 text-muted">{description}</p>
        </div>
        {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
      </div>

      <div className="space-y-3 lg:hidden">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">{title}</h2>
        <p className="text-sm leading-6 text-muted">{description}</p>
        {actions ? <div className="grid gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}
