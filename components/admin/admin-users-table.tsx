"use client";

import { format, parseISO } from "date-fns";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useWorkspaceData } from "@/hooks/use-workspace-data";
import { ADMIN_EMAIL } from "@/lib/utils/constants";

export function AdminUsersTable() {
  const workspace = useWorkspaceData();
  const userLabel = (workspace.currentUser?.full_name || workspace.currentUser?.email || "U")
    .slice(0, 2)
    .toUpperCase();

  if (workspace.loading) {
    return <LoadingSkeleton className="h-[420px] w-full" />;
  }

  if (workspace.error) {
    return (
      <EmptyState
        title="Area admin non disponibile"
        description={workspace.error}
        actionLabel="Riprova"
        onAction={() => void workspace.reload()}
      />
    );
  }

  return (
    <div>
      <AppHeader
        title="Admin"
        description="Approva nuovi utenti o revoca l’accesso. Gli utenti non approvati restano bloccati sulla pagina di attesa."
        userLabel={userLabel}
      />

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-black/[0.06]">
            <thead className="bg-[#fafafa]">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Nome
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Email
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Registrazione
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Stato
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05] bg-white">
              {workspace.data.allUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-5 py-4 text-sm font-medium text-ink">
                    {user.full_name || "Utente"}
                  </td>
                  <td className="px-5 py-4 text-sm text-muted">{user.email}</td>
                  <td className="px-5 py-4 text-sm text-muted">
                    {format(parseISO(user.created_at), "dd/MM/yyyy")}
                  </td>
                  <td className="px-5 py-4 text-sm">
                    {user.is_approved ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                        Approvato
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
                        In attesa
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {user.email === ADMIN_EMAIL ? null : user.is_approved ? (
                      <Button
                        variant="danger"
                        onClick={() => void workspace.setUserApproval(user.id, false)}
                      >
                        Revoca accesso
                      </Button>
                    ) : (
                      <Button
                        variant="success"
                        onClick={() => void workspace.setUserApproval(user.id, true)}
                      >
                        Approva
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
