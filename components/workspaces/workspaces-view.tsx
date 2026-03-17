"use client";

import { Edit3, FolderOpen, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { useWorkspaceContext } from "@/components/layout/workspace-context";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";

export function WorkspacesView() {
  const {
    currentProfile,
    loading,
    error,
    workspaces,
    activeWorkspace,
    createWorkspace,
    renameWorkspace,
    deleteWorkspace,
    setActiveWorkspace
  } = useWorkspaceContext();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const isAdmin = currentProfile.is_admin || currentProfile.email === "ludovico.righetto@gmail.com";

  if (loading) {
    return <div className="panel p-6 text-sm text-muted">Caricamento workspace...</div>;
  }

  return (
    <div>
      <AppHeader
        title="I miei workspaces"
        description={
          isAdmin
            ? "Crea e gestisci i workspace. Gli accessi utenti si impostano dalla pagina Admin."
            : "Visualizzi solo i workspace abilitati dal tuo amministratore."
        }
        actions={
          isAdmin ? (
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crea nuovo workspace
            </Button>
          ) : null
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workspaces.map((workspace) => {
          const isActive = activeWorkspace?.id === workspace.id;
          const isEditing = editingId === workspace.id;
          return (
            <div key={workspace.id} className="panel space-y-3 p-4">
              <div className="space-y-1">
                {isEditing ? (
                  <Input
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    className="min-h-10 text-base font-semibold"
                    autoFocus
                  />
                ) : (
                  <p className="text-lg font-semibold text-ink">{workspace.name}</p>
                )}
                <p className="text-sm leading-6 text-muted">
                  {workspace.description || "Workspace personale"}
                </p>
              </div>
              <div className="flex gap-2">
                {isAdmin && isEditing ? (
                  <>
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        setEditingId(null);
                        setEditName("");
                      }}
                    >
                      Annulla
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={async () => {
                        if (!editName.trim()) return;
                        await renameWorkspace(workspace.id, editName);
                        setEditingId(null);
                        setEditName("");
                      }}
                    >
                      Salva
                    </Button>
                  </>
                ) : isAdmin ? (
                  <>
                    <Button
                      variant="ghost"
                      className="flex-1 justify-center gap-2"
                      onClick={() => {
                        setEditingId(workspace.id);
                        setEditName(workspace.name);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                      Modifica nome
                    </Button>
                    <Button
                      variant="ghost"
                      className="min-h-12 min-w-12 px-3 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      onClick={() =>
                        setDeleteTarget({
                          id: workspace.id,
                          name: workspace.name
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : null}
              </div>
              <Button
                variant={isActive ? "primary" : "secondary"}
                className="w-full justify-center gap-2"
                onClick={() => setActiveWorkspace(workspace.id)}
              >
                <FolderOpen className="h-4 w-4" />
                {isActive ? "Workspace attivo" : "Apri workspace"}
              </Button>
            </div>
          );
        })}
      </div>

      {error ? (
        <div className="panel mt-4 border-rose-200 bg-rose-50/60 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {workspaces.length === 0 ? (
        <div className="panel mt-4 p-6 text-sm text-muted">
          {isAdmin
            ? "Nessun workspace disponibile. Crea il primo workspace."
            : "Nessun workspace abilitato. Contatta l'amministratore."}
        </div>
      ) : null}

      <Modal open={open} onClose={() => setOpen(false)} title="Nuovo workspace" className="max-w-md">
        <div className="space-y-4 p-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">Nome workspace</span>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Workspace prodotto"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">Descrizione</span>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Breve descrizione (opzionale)"
              className="min-h-[100px]"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button
              onClick={async () => {
                if (!name.trim()) return;
                await createWorkspace(name.trim(), description.trim());
                setName("");
                setDescription("");
                setOpen(false);
              }}
            >
              Crea workspace
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Eliminare workspace?"
        description={
          deleteTarget
            ? `Sei sicuro di voler eliminare il workspace "${deleteTarget.name}"?`
            : "Sei sicuro di voler eliminare questo workspace?"
        }
        confirmLabel="Elimina"
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteWorkspace(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
