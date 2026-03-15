import { AppShell } from "@/components/layout/app-shell";
import { requireAuth } from "@/lib/auth/session";

export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAuth();

  return <AppShell profile={profile}>{children}</AppShell>;
}
