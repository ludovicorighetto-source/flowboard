"use client";

import { LayoutGrid, Plus } from "lucide-react";
import { useState } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { RoadmapPhaseColumn } from "@/components/roadmap/roadmap-phase-column";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Modal } from "@/components/ui/modal";
import { useWorkspaceData } from "@/hooks/use-workspace-data";

export function RoadmapView() {
  const workspace = useWorkspaceData();
  const [overview, setOverview] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#0071e3");

  if (workspace.loading) {
    return <LoadingSkeleton className="h-[520px] w-full" />;
  }

  if (workspace.error) {
    return (
      <EmptyState
        title="Roadmap non disponibile"
        description={workspace.error}
        actionLabel="Riprova"
        onAction={() => void workspace.reload()}
      />
    );
  }

  return (
    <div>
      <AppHeader
        title="Roadmap"
        description="Organizza il lavoro per fasi e goal, collegando i task operativi agli obiettivi di medio periodo."
        actions={
          <>
            <Button variant="secondary" onClick={() => setOverview((current) => !current)}>
              <LayoutGrid className="mr-2 h-4 w-4" />
              {overview ? "Vista dettagliata" : "Vista overview"}
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuova fase
            </Button>
          </>
        }
      />

      {workspace.data.phases.length === 0 ? (
        <EmptyState
          title="Nessuna fase nella roadmap"
          description="Crea la prima fase per impostare una visione d’insieme e collegare i task ai goal."
          actionLabel="Crea prima fase"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <div className="subtle-scrollbar flex gap-4 overflow-x-auto pb-4">
          {workspace.data.phases.map((phase, index) => (
            <div key={phase.id} className="flex items-stretch gap-4">
              <RoadmapPhaseColumn
                phase={phase}
                overview={overview}
                tasks={workspace.data.tasks}
                onUpdatePhase={workspace.updatePhase}
                onDeletePhase={workspace.deletePhase}
                onCreateGoal={workspace.createGoal}
                onUpdateGoal={workspace.updateGoal}
                onDeleteGoal={workspace.deleteGoal}
                onSetGoalTasks={workspace.setGoalTasks}
              />
              {index < workspace.data.phases.length - 1 ? (
                <div className="hidden items-center text-3xl text-black/12 lg:flex">→</div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nuova fase" className="max-w-md">
        <div className="space-y-4 p-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">Titolo</span>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">Colore</span>
            <input
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="h-11 w-full rounded-control border border-black/[0.08] bg-white p-1"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Annulla
            </Button>
            <Button
              onClick={async () => {
                if (!title.trim()) return;
                await workspace.createPhase(title.trim(), color);
                setTitle("");
                setCreateOpen(false);
              }}
            >
              Crea fase
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
