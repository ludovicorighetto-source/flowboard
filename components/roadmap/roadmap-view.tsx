"use client";

import { ArrowDown, ArrowRight, LayoutGrid, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { RoadmapPhaseColumn } from "@/components/roadmap/roadmap-phase-column";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Modal } from "@/components/ui/modal";
import { useWorkspaceData } from "@/hooks/use-workspace-data";
import { getPhaseProgress } from "@/lib/utils/roadmap";

export function RoadmapView() {
  const workspace = useWorkspaceData();
  const [overview, setOverview] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#0071e3");
  const [focusPhaseId, setFocusPhaseId] = useState<string | null>(null);
  const roadmapScrollRef = useRef<HTMLDivElement>(null);
  const userLabel = (workspace.currentUser?.full_name || workspace.currentUser?.email || "U")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (!focusPhaseId) return;
    const timer = window.setTimeout(() => {
      const target = roadmapScrollRef.current?.querySelector<HTMLElement>(
        `[data-phase-id="${focusPhaseId}"]`
      );
      target?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      setFocusPhaseId(null);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [focusPhaseId]);

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

  const phaseSnapshots = workspace.data.phases.map((phase) => ({
    phase,
    progress: getPhaseProgress(phase, workspace.data.tasks, workspace.data.lists)
  }));

  return (
    <div>
      <AppHeader
        title="Roadmap"
        description="Organizza il lavoro per fasi e goal, collegando i task operativi agli obiettivi di medio periodo."
        userLabel={userLabel}
        actions={
          <>
            <Button variant={overview ? "primary" : "secondary"} onClick={() => setOverview((current) => !current)}>
              <LayoutGrid className="mr-2 h-4 w-4" />
              {overview ? "Overview attiva" : "Vista overview"}
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuova fase
            </Button>
          </>
        }
      />

      {overview ? (
        <div className="mb-4 rounded-xl border border-action/25 bg-[#eef4ff] px-4 py-3 text-sm font-medium text-action">
          Overview mode attiva: vista strategica completa con progressi fase per fase.
        </div>
      ) : null}

      {workspace.data.phases.length === 0 ? (
        <EmptyState
          title="Nessuna fase nella roadmap"
          description="Crea la prima fase per impostare una visione d’insieme e collegare i task ai goal."
          actionLabel="Crea prima fase"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <>
          {overview ? (
            <div className="space-y-2.5 lg:hidden">
              {phaseSnapshots.map(({ phase, progress }, index) => (
                <button
                  key={phase.id}
                  type="button"
                  className="focus-ring panel w-full p-3 text-left"
                  onClick={() => {
                    setOverview(false);
                    setFocusPhaseId(phase.id);
                  }}
                >
                  <p className="line-clamp-2 text-sm font-semibold text-ink">{phase.title}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
                    <span>
                      {progress.completedGoals}/{progress.goals} goal
                    </span>
                    <span className="font-semibold text-ink">{progress.percent}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/[0.08]">
                    <div className="h-full rounded-full bg-action" style={{ width: `${progress.percent}%` }} />
                  </div>
                  {index < phaseSnapshots.length - 1 ? (
                    <div className="mt-3 flex items-center justify-center text-action/85">
                      <ArrowDown className="h-4 w-4" />
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}

          <div className={`space-y-3 lg:hidden ${overview ? "hidden" : ""}`}>
            {workspace.data.phases.map((phase, index) => (
              <div key={phase.id} data-phase-id={phase.id} className="space-y-3">
                <RoadmapPhaseColumn
                  phase={phase}
                  overview={false}
                  mobileFullWidth
                  lists={workspace.data.lists}
                  tasks={workspace.data.tasks}
                  onUpdatePhase={workspace.updatePhase}
                  onDeletePhase={workspace.deletePhase}
                  onCreateGoal={workspace.createGoal}
                  onUpdateGoal={workspace.updateGoal}
                  onDeleteGoal={workspace.deleteGoal}
                  onSetGoalTasks={workspace.setGoalTasks}
                />
                {index < workspace.data.phases.length - 1 ? (
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-2 rounded-full border border-action/20 bg-[#eef4ff] px-4 py-2 text-action">
                      <span className="h-px w-6 bg-action/40" />
                      <ArrowDown className="h-4 w-4" />
                      <span className="h-px w-6 bg-action/40" />
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {overview ? (
            <div className="hidden lg:block">
              <div className="grid grid-cols-3 gap-3 xl:grid-cols-4">
                {phaseSnapshots.map(({ phase, progress }, index) => (
                  <button
                    key={phase.id}
                    type="button"
                    className="focus-ring panel min-h-[150px] p-3 text-left"
                    onClick={() => {
                      setOverview(false);
                      setFocusPhaseId(phase.id);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-sm font-semibold text-ink">{phase.title}</p>
                      {index < phaseSnapshots.length - 1 ? (
                        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-action/80" />
                      ) : null}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
                      <span>
                        {progress.completedGoals}/{progress.goals} goal
                      </span>
                      <span className="font-semibold text-ink">{progress.percent}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/[0.08]">
                      <div className="h-full rounded-full bg-action" style={{ width: `${progress.percent}%` }} />
                    </div>
                    <p className="mt-2 text-[11px] text-muted">Fase {index + 1}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              ref={roadmapScrollRef}
              className="subtle-scrollbar hidden gap-4 overflow-x-auto pb-4 lg:flex"
            >
              {workspace.data.phases.map((phase, index) => (
                <div key={phase.id} data-phase-id={phase.id} className="flex items-stretch gap-4">
                  <RoadmapPhaseColumn
                    phase={phase}
                    overview={false}
                    lists={workspace.data.lists}
                    tasks={workspace.data.tasks}
                    onUpdatePhase={workspace.updatePhase}
                    onDeletePhase={workspace.deletePhase}
                    onCreateGoal={workspace.createGoal}
                    onUpdateGoal={workspace.updateGoal}
                    onDeleteGoal={workspace.deleteGoal}
                    onSetGoalTasks={workspace.setGoalTasks}
                  />
                  {index < workspace.data.phases.length - 1 ? (
                    <div className="flex items-center">
                      <div className="flex items-center gap-2 rounded-full border border-action/15 bg-[#eef4ff] px-3 py-1.5 text-action/85">
                        <span className="h-px w-5 bg-action/35" />
                        <ArrowRight className="h-4 w-4" />
                        <span className="h-px w-5 bg-action/35" />
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </>
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
