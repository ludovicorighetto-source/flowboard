import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function PendingPage() {
  const { user, profile } = await getCurrentProfile();

  if (!user) redirect("/login");
  if (profile?.is_approved) redirect("/board");

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="panel max-w-xl space-y-5 px-8 py-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">FlowBoard</p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Account in attesa</h1>
        <p className="text-sm leading-7 text-muted">
          Il tuo account e in attesa di approvazione da parte dell&apos;amministratore.
          Quando verrai approvato potrai accedere normalmente all&apos;app.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/">
            <Button variant="secondary">Controlla di nuovo</Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost">Torna al login</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
