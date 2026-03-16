"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { RoadmapGoalCard } from "@/components/roadmap/roadmap-goal-card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { RoadmapPhase, Task } from "@/types";

export function RoadmapPhaseColumn({
  phase,
  overview,
  mobileFullWidth = false,
  tasks,
  onUpdatePhase,
  onDeletePhase,
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal,
  onSetGoalTasks
}: {
  phase: RoadmapPhase;
  overview: boolean;
  mobileFullWidth?: boolean;
  tasks: Task[];
  onUpdatePhase: (
    phaseId: string,
    patch: { title?: string; description?: string | null; color?: string }
  ) => Promise<void>;
  onDeletePhase: (phaseId: string) => Promise<void>;
  onCreateGoal: (phaseId: string, title: string) => Promise<void>;
  onUpdateGoal: (
    goalId: string,
    patch: { title?: string; description?: string | null }
  ) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
  onSetGoalTasks: (goalId: string, taskIds: string[]) => Promise<void>;
}) {
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const widthClass = mobileFullWidth
    ? overview
      ? "w-full lg:w-[240px]"
      : "w-full lg:w-[360px]"
    : overview
      ? "w-[240px]"
      : "w-[calc(100vw-2rem)] max-w-[360px] sm:w-[360px]";

  return (
    <>
      <div className={`panel ${mobileFullWidth ? "" : "shrink-0"} ${widthClass} p-4`}>
        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Input
              defaultValue={phase.title}
              onBlur={(event) => onUpdatePhase(phase.id, { title: event.target.value })}
              className={`border-0 bg-transparent px-0 font-semibold ${overview ? "min-h-10 text-base" : "min-h-12 text-lg"}`}
            />
            <Button
              variant="ghost"
              className={overview ? "min-h-9 min-w-9 px-2 py-2" : ""}
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className={overview ? "h-3.5 w-3.5" : "h-4 w-4"} />
            </Button>
          </div>
          {!overview ? (
            <>
              <Textarea
                defaultValue={phase.description || ""}
                onBlur={(event) =>
                  onUpdatePhase(phase.id, { description: event.target.value || null })
                }
                className="min-h-[90px]"
              />
              <label className="block space-y-2">
                <span className="text-sm font-medium text-ink">Colore fase</span>
                <input
                  type="color"
                  defaultValue={phase.color}
                  onChange={(event) => onUpdatePhase(phase.id, { color: event.target.value })}
                  className="h-11 w-full rounded-control border border-black/[0.08] bg-white p-1"
                />
              </label>
            </>
          ) : (
            <p className="line-clamp-2 text-xs leading-5 text-muted">
              {phase.description || "Nessuna descrizione"}
            </p>
          )}
        </div>

        {!overview ? (
          <div className="mb-4 flex items-center gap-2">
            <Input
              placeholder="Nuovo goal"
              value={newGoalTitle}
              onChange={(event) => setNewGoalTitle(event.target.value)}
            />
            <Button
              className={overview ? "min-h-10 px-3 py-2" : ""}
              onClick={async () => {
                if (!newGoalTitle.trim()) return;
                await onCreateGoal(phase.id, newGoalTitle.trim());
                setNewGoalTitle("");
              }}
            >
              <Plus className={overview ? "h-3.5 w-3.5" : "h-4 w-4"} />
            </Button>
          </div>
        ) : null}

        <div className="space-y-2">
          {(phase.roadmap_goals || []).map((goal) => (
            <RoadmapGoalCard
              key={goal.id}
              goal={goal}
              allTasks={tasks}
              overview={overview}
              onUpdate={onUpdateGoal}
              onDelete={onDeleteGoal}
              onSetTasks={onSetGoalTasks}
            />
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Eliminare questa fase?"
        description="La fase verra eliminata insieme ai goal collegati e ai relativi link ai task."
        confirmLabel="Elimina fase"
        onConfirm={async () => {
          await onDeletePhase(phase.id);
          setShowDeleteConfirm(false);
        }}
      />
    </>
  );
}
