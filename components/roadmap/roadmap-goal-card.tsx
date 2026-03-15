"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { RoadmapGoal, Task } from "@/types";

export function RoadmapGoalCard({
  goal,
  allTasks,
  onUpdate,
  onDelete,
  onSetTasks
}: {
  goal: RoadmapGoal;
  allTasks: Task[];
  onUpdate: (goalId: string, patch: { title?: string; description?: string | null }) => Promise<void>;
  onDelete: (goalId: string) => Promise<void>;
  onSetTasks: (goalId: string, taskIds: string[]) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const selectedIds = goal.goal_tasks?.map((item) => item.task_id) || [];
  const linkedTasks = useMemo(
    () => allTasks.filter((task) => selectedIds.includes(task.id)),
    [allTasks, selectedIds]
  );

  return (
    <div className="rounded-panel border border-black/[0.06] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-ink">{goal.title}</p>
          <p className="text-xs text-muted">{linkedTasks.length} task collegati</p>
        </div>
        <button
          type="button"
          className="text-muted hover:text-ink"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {goal.description ? <p className="mt-2 text-sm leading-6 text-muted">{goal.description}</p> : null}

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
            <Button variant="danger" onClick={() => onDelete(goal.id)}>
              Elimina goal
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
