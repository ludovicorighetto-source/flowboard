"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { useWorkspaceContext, WorkspaceProvider } from "@/components/layout/workspace-context";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

export function AppShell({
  profile,
  children
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <WorkspaceProvider profile={profile}>
      <ShellContent profile={profile} onLogout={handleLogout}>
        {children}
      </ShellContent>
    </WorkspaceProvider>
  );
}

function ShellContent({
  profile,
  onLogout,
  children
}: {
  profile: Profile;
  onLogout: () => Promise<void> | void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { loading, activeWorkspace } = useWorkspaceContext();
  const mustBlock =
    !loading &&
    !activeWorkspace &&
    !profile.is_admin &&
    profile.email !== "ludovico.righetto@gmail.com" &&
    pathname !== "/workspaces";

  return (
    <div className="mx-auto flex min-h-screen max-w-[1680px] flex-col gap-3 px-3 py-3 lg:flex-row lg:gap-6 lg:px-6 lg:py-4">
      <AppSidebar profile={profile} onLogout={onLogout} />
      <main className="min-w-0 flex-1 pb-4 lg:py-1">
        {mustBlock ? (
          <div className="panel max-w-xl space-y-4 p-6">
            <h2 className="text-xl font-semibold text-ink">Accesso workspace richiesto</h2>
            <p className="text-sm text-muted">
              Non sei assegnato ad alcun workspace. Chiedi all&apos;admin di aggiungerti a un workspace.
            </p>
            <Link href="/workspaces">
              <Button>Apri area workspace</Button>
            </Link>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
