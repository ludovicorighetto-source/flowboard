"use client";

import { Edit3, FolderOpen, Plus } from "lucide-react";

import { AppHeader } from "@/components/layout/app-header";
import { useWorkspaceContext } from "@/components/layout/workspace-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export function WorkspacesView() {
  const {
    workspaces,
    activeWorkspace,
    createWorkspace,
    renameWorkspace,
    setActiveWorkspace
  } = useWorkspaceContext();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  return (
    <div>
      <AppHeader
        title="I miei workspaces"
        description="Gestisci i tuoi workspace e scegli in quale contesto lavorare."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Crea nuovo workspace
          </Button>
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
                {isEditing ? (
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
                      onClick={() => {
                        if (!editName.trim()) return;
                        renameWorkspace(workspace.id, editName);
                        setEditingId(null);
                        setEditName("");
                      }}
                    >
                      Salva
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-center gap-2"
                    onClick={() => {
                      setEditingId(workspace.id);
                      setEditName(workspace.name);
                    }}
                  >
                    <Edit3 className="h-4 w-4" />
                    Modifica nome
                  </Button>
                )}
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
              onClick={() => {
                if (!name.trim()) return;
                createWorkspace(name.trim(), description.trim());
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
    </div>
  );
}
