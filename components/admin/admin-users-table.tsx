"use client";

import { format, parseISO } from "date-fns";
import { useMemo, useState } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useWorkspaceData } from "@/hooks/use-workspace-data";
import { ADMIN_EMAIL } from "@/lib/utils/constants";

export function AdminUsersTable() {
  const workspace = useWorkspaceData();
  const userLabel = (workspace.currentUser?.full_name || workspace.currentUser?.email || "U")
    .slice(0, 2)
    .toUpperCase();
  const [revokeTarget, setRevokeTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const pendingUsers = useMemo(
    () => workspace.data.allUsers.filter((user) => !user.is_approved),
    [workspace.data.allUsers]
  );
  const approvedUsers = useMemo(
    () => workspace.data.allUsers.filter((user) => user.is_approved),
    [workspace.data.allUsers]
  );

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

  function notifyApprovalChange() {
    window.dispatchEvent(new Event("flowboard:approvals-changed"));
  }

  function UsersTable({
    users,
    mode
  }: {
    users: typeof pendingUsers;
    mode: "pending" | "approved";
  }) {
    return (
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
              {users.map((user) => (
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
                    {user.email === ADMIN_EMAIL ? null : mode === "pending" ? (
                      <Button
                        variant="success"
                        onClick={async () => {
                          await workspace.setUserApproval(user.id, true);
                          notifyApprovalChange();
                        }}
                      >
                        Approva
                      </Button>
                    ) : (
                      <Button
                        variant="danger"
                        onClick={() =>
                          setRevokeTarget({
                            id: user.id,
                            name: user.full_name || user.email
                          })
                        }
                      >
                        Revoca accesso
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
      <AppHeader
        title="Admin"
        description="Approva nuovi utenti o revoca l’accesso. Gli utenti non approvati restano bloccati sulla pagina di attesa."
        userLabel={userLabel}
      />

      <section className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">Utenti in attesa</h3>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
            {pendingUsers.length}
          </span>
        </div>
        {pendingUsers.length === 0 ? (
          <div className="rounded-xl border border-black/[0.06] bg-white px-4 py-6 text-sm text-muted">
            Nessun utente in attesa di approvazione.
          </div>
        ) : (
          <UsersTable users={pendingUsers} mode="pending" />
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">Utenti approvati</h3>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            {approvedUsers.length}
          </span>
        </div>
        <UsersTable users={approvedUsers} mode="approved" />
      </section>
      </div>

      <ConfirmDialog
        open={Boolean(revokeTarget)}
        onClose={() => setRevokeTarget(null)}
        title="Revocare l'accesso utente?"
        description={
          revokeTarget
            ? `Sei sicuro di voler revocare l'accesso a ${revokeTarget.name}?`
            : "Sei sicuro di voler revocare l'accesso a questo utente?"
        }
        confirmLabel="Revoca"
        onConfirm={async () => {
          if (!revokeTarget) return;
          await workspace.setUserApproval(revokeTarget.id, false);
          notifyApprovalChange();
          setRevokeTarget(null);
        }}
      />
    </>
  );
}
