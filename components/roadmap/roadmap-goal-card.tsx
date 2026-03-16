"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getGoalProgress } from "@/lib/utils/roadmap";
import type { List, RoadmapGoal, Task } from "@/types";

export function RoadmapGoalCard({
  goal,
  lists,
  allTasks,
  overview = false,
  onUpdate,
  onDelete,
  onSetTasks
}: {
  goal: RoadmapGoal;
  lists: List[];
  allTasks: Task[];
  overview?: boolean;
  onUpdate: (
    goalId: string,
    patch: { title?: string; description?: string | null; is_completed?: boolean }
  ) => Promise<void>;
  onDelete: (goalId: string) => Promise<void>;
  onSetTasks: (goalId: string, taskIds: string[]) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const selectedIds = goal.goal_tasks?.map((item) => item.task_id) || [];
  const linkedTasks = useMemo(
    () => allTasks.filter((task) => selectedIds.includes(task.id)),
    [allTasks, selectedIds]
  );
  const goalProgress = getGoalProgress(goal, allTasks, lists);

  return (
    <>
      <div
        className={`rounded-panel border bg-white ${
          goalProgress.isCompleted ? "border-green-200 bg-green-50/40" : "border-black/[0.06]"
        } ${overview ? "p-3" : "p-4"}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className={`break-words font-semibold text-ink ${overview ? "text-xs" : "text-sm"}`}>{goal.title}</p>
            <p className="text-xs text-muted">
              {goalProgress.completedLinkedTasks}/{goalProgress.linkedTasks} task completati
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`rounded-control border px-2.5 py-1 text-[11px] font-semibold transition ${
                goal.is_completed
                  ? "border-green-300 bg-green-100 text-green-700"
                  : "border-black/[0.08] bg-white text-muted hover:text-ink"
              }`}
              onClick={() => void onUpdate(goal.id, { is_completed: !goal.is_completed })}
            >
              {goal.is_completed ? "Segnato completato" : "Segna completato"}
            </button>
            {overview ? null : (
              <button
                type="button"
                className="text-muted hover:text-ink"
                onClick={() => setExpanded((current) => !current)}
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>

        <div className="mt-2 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-muted">
            <span>Progresso goal</span>
            <span className="font-semibold text-ink">{goalProgress.percent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
            <div className="h-full rounded-full bg-action" style={{ width: `${goalProgress.percent}%` }} />
          </div>
        </div>

        {goal.description ? (
          <p className={`mt-2 leading-6 text-muted ${overview ? "line-clamp-2 text-xs" : "text-sm"}`}>
            {goal.description}
          </p>
        ) : null}

        {overview ? (
          <div className="mt-3 space-y-1">
            {linkedTasks.slice(0, 2).map((task) => (
              <p key={task.id} className="line-clamp-1 text-[11px] text-muted">
                • {task.title}
              </p>
            ))}
          </div>
        ) : null}

        {expanded ? (
          <div className="mt-4 space-y-3 border-t border-black/[0.06] pt-4">
            <Input
              defaultValue={goal.title}
              onBlur={(event) => onUpdate(goal.id, { title: event.target.value })}
            />
            <Textarea
              defaultValue={goal.description || ""}
              onBlur={(event) => onUpdate(goal.id, { description: event.target.value || null })}
            />
            <div className="space-y-2">
              {allTasks.map((task) => {
                const checked = selectedIds.includes(task.id);
                return (
                  <label
                    key={task.id}
                    className="flex cursor-pointer items-center justify-between rounded-control border border-black/[0.06] px-3 py-2"
                  >
                    <span className="text-sm text-ink">{task.title}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => {
                        const next = event.target.checked
                          ? [...selectedIds, task.id]
                          : selectedIds.filter((id) => id !== task.id);
                        void onSetTasks(goal.id, next);
                      }}
                    />
                  </label>
                );
              })}
            </div>
            <div className="flex justify-end">
              <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
                Elimina goal
              </Button>
            </div>
          </div>
        ) : null}

        {!overview && !expanded ? (
          <div className="mt-3 flex justify-end">
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(true)}>
              Elimina
            </Button>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Eliminare questo goal?"
        description="Il goal verra eliminato e i collegamenti ai task saranno rimossi."
        confirmLabel="Elimina goal"
        onConfirm={async () => {
          await onDelete(goal.id);
          setShowDeleteConfirm(false);
        }}
      />
    </>
  );
}
