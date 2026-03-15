"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { RoadmapGoalCard } from "@/components/roadmap/roadmap-goal-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { RoadmapPhase, Task } from "@/types";

export function RoadmapPhaseColumn({
  phase,
  overview,
  tasks,
  onUpdatePhase,
  onDeletePhase,
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal,
  onSetGoalTasks,
  mobile = false
}: {
  phase: RoadmapPhase;
  overview: boolean;
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
  mobile?: boolean;
}) {
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className={`panel ${mobile ? "w-full" : "shrink-0"} ${
        mobile ? "" : overview ? "w-[280px]" : "w-[360px]"
      } p-4`}
    >
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Input
            defaultValue={phase.title}
            onBlur={(event) => onUpdatePhase(phase.id, { title: event.target.value })}
            className="border-0 bg-transparent px-0 text-lg font-semibold"
          />
          <Button variant="ghost" onClick={() => onDeletePhase(phase.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
          {mobile ? (
            <Button variant="ghost" onClick={() => setExpanded((current) => !current)}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          ) : null}
        </div>
        {!overview && (!mobile || expanded) ? (
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
        ) : null}
      </div>

      {!mobile || expanded ? (
        <>
          <div className="mb-4 flex items-center gap-2">
            <Input
              placeholder="Nuovo goal"
              value={newGoalTitle}
              onChange={(event) => setNewGoalTitle(event.target.value)}
            />
            <Button
              onClick={async () => {
                if (!newGoalTitle.trim()) return;
                await onCreateGoal(phase.id, newGoalTitle.trim());
                setNewGoalTitle("");
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {(phase.roadmap_goals || []).map((goal) => (
              <RoadmapGoalCard
                key={goal.id}
                goal={goal}
                allTasks={tasks}
                onUpdate={onUpdateGoal}
                onDelete={onDeleteGoal}
                onSetTasks={onSetGoalTasks}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
