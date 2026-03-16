"use client";

import { format, parseISO } from "date-fns";

import { AvatarGroup } from "@/components/ui/avatar-group";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_META } from "@/lib/utils/constants";
import { getChecklistProgress } from "@/lib/utils/task";
import type { Task } from "@/types";

export function TaskCard({
  task,
  compact = false,
  listColorClass,
  onClick
}: {
  task: Task;
  compact?: boolean;
  listColorClass: string;
  onClick: () => void;
}) {
  const progress = getChecklistProgress(task.checklists);
  const priority = PRIORITY_META[task.priority];

  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring panel flex w-full items-stretch gap-3 px-0 py-0 text-left transition hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className={`w-1 rounded-l-md ${listColorClass}`} />
      <div className={`w-full ${compact ? "space-y-2 px-2.5 py-2.5" : "space-y-3 px-3 py-3 lg:px-4 lg:py-4"}`}>
        <div className="flex items-start justify-between gap-3">
          <p className={`line-clamp-2 font-semibold text-ink ${compact ? "text-xs leading-5" : "text-sm leading-6"}`}>
            {task.title}
          </p>
          {!compact ? <Badge className={priority.className}>{priority.label}</Badge> : null}
        </div>

        {!compact && task.task_labels.length ? (
          <div className="flex flex-wrap gap-2">
            {task.task_labels.map(({ label }) => (
              <span
                key={label.id}
                className="rounded-full px-2 py-1 text-[11px] font-medium text-white"
                style={{ backgroundColor: label.color }}
              >
                {label.name}
              </span>
            ))}
          </div>
        ) : null}

        <div className={compact ? "space-y-1.5" : "space-y-2"}>
          <div className="flex items-center justify-between text-[11px] text-muted">
            <span>
              Checklist {progress.completed}/{progress.total}
            </span>
            <span>{progress.percent}%</span>
          </div>
          <div className={`${compact ? "h-1.5" : "h-2"} overflow-hidden rounded-full bg-black/[0.06]`}>
            <div
              className="h-full rounded-full bg-action transition-[width]"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          {task.due_date ? (
            <span className="text-[11px] font-medium text-muted">
              Scade il {format(parseISO(task.due_date), "dd/MM")}
            </span>
          ) : (
            <span className="text-[11px] text-muted">Nessuna scadenza</span>
          )}
          <AvatarGroup users={task.task_assignees.map((relation) => relation.user)} />
        </div>
      </div>
    </button>
  );
}
