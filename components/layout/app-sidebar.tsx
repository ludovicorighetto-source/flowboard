"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  CalendarDays,
  KanbanSquare,
  ShieldCheck,
  Target,
  LogOut,
  X
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useWorkspaceContext } from "@/components/layout/workspace-context";
import { cn } from "@/lib/utils/cn";
import type { Profile } from "@/types";

const items = [
  { href: "/workspaces", label: "I miei workspaces", icon: BriefcaseBusiness },
  { href: "/board", label: "Board", icon: KanbanSquare },
  { href: "/planner", label: "Planner", icon: CalendarDays },
  { href: "/roadmap", label: "Roadmap", icon: Target }
];

export function AppSidebar({
  profile,
  onLogout
}: {
  profile: Profile;
  onLogout: () => Promise<void> | void;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activeWorkspace } = useWorkspaceContext();

  useEffect(() => {
    function openNav() {
      setMobileOpen(true);
    }

    window.addEventListener("flowboard:open-nav", openNav);
    return () => window.removeEventListener("flowboard:open-nav", openNav);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const drawerContent = (
    <div className="panel flex h-full flex-col px-4 py-5">
      <div className="mb-6 flex items-center justify-between px-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            FlowBoard
          </p>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Workspace</p>
          <h1 className="line-clamp-2 text-lg font-semibold tracking-tight text-ink">
            {activeWorkspace?.name || "Workspace principale"}
          </h1>
        </div>
        <button
          type="button"
          className="focus-ring inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-muted lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Chiudi menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition",
                active
                  ? "bg-[#eef4ff] text-action"
                  : "text-muted hover:bg-black/[0.04] hover:text-ink"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        {profile.is_admin ? (
          <Link
            href="/admin"
            className={cn(
              "flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition",
              pathname.startsWith("/admin")
                ? "bg-[#eef4ff] text-action"
                : "text-muted hover:bg-black/[0.04] hover:text-ink"
            )}
          >
            <ShieldCheck className="h-5 w-5" />
            Admin
          </Link>
        ) : null}
      </nav>

      <div className="mt-auto space-y-4 rounded-xl border border-black/[0.06] bg-[#fafafa] p-4">
        <div>
          <p className="text-sm font-medium text-ink">{profile.full_name || "Account"}</p>
          <p className="text-sm text-muted">{profile.email}</p>
        </div>
        <Button variant="secondary" className="w-full justify-center gap-2" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          Esci
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden">
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/20 transition-opacity",
            mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          )}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[320px] transform p-2 transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {drawerContent}
        </aside>
      </div>

      <aside className="hidden w-full max-w-[280px] shrink-0 lg:sticky lg:top-0 lg:block lg:h-screen lg:px-4 lg:py-5">
        {drawerContent}
      </aside>
    </>
  );
}
