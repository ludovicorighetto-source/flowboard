"use client";

import { useRouter } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { WorkspaceProvider } from "@/components/layout/workspace-context";
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
      <div className="mx-auto flex min-h-screen max-w-[1680px] flex-col gap-3 px-3 py-3 lg:flex-row lg:gap-6 lg:px-6 lg:py-4">
        <AppSidebar profile={profile} onLogout={handleLogout} />
        <main className="min-w-0 flex-1 pb-4 lg:py-1">{children}</main>
      </div>
    </WorkspaceProvider>
  );
}
