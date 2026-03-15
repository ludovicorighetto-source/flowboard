"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, KanbanSquare, ShieldCheck, Target, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { Profile } from "@/types";

const items = [
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

  return (
    <aside className="w-full max-w-[280px] shrink-0 lg:sticky lg:top-0 lg:h-screen lg:px-4 lg:py-5">
      <div className="panel flex h-full flex-col px-4 py-5">
        <div className="space-y-1 px-2 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            FlowBoard
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Workspace
          </h1>
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
                  "flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-[#eef4ff] text-action"
                    : "text-muted hover:bg-black/[0.04] hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          {profile.is_admin ? (
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition",
                pathname.startsWith("/admin")
                  ? "bg-[#eef4ff] text-action"
                  : "text-muted hover:bg-black/[0.04] hover:text-ink"
              )}
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          ) : null}
        </nav>

        <div className="mt-auto space-y-4 rounded-panel border border-black/[0.06] bg-[#fafafa] p-4">
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
    </aside>
  );
}
