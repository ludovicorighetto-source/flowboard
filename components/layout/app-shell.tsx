"use client";

import { useRouter } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar";
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
    <div className="mx-auto flex min-h-screen max-w-[1680px] flex-col gap-4 px-4 py-4 lg:flex-row lg:gap-6 lg:px-6">
      <AppSidebar profile={profile} onLogout={handleLogout} />
      <main className="min-w-0 flex-1 py-1">{children}</main>
    </div>
  );
}
