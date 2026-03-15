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
  onClick
}: {
  task: Task;
  compact?: boolean;
  onClick: () => void;
}) {
  const progress = getChecklistProgress(task.checklists);
  const priority = PRIORITY_META[task.priority];

  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring panel w-full space-y-3 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-soft lg:p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="line-clamp-2 text-sm font-semibold leading-6 text-ink">{task.title}</p>
        {!compact ? <Badge className={priority.className}>{priority.label}</Badge> : null}
      </div>

      {task.task_labels.length ? (
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

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            Checklist {progress.completed}/{progress.total}
          </span>
          <span>{progress.percent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-black/[0.06]">
          <div
            className="h-full rounded-full bg-action transition-[width]"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        {task.due_date ? (
          <span className="text-xs font-medium text-muted">
            Scade il {format(parseISO(task.due_date), "dd/MM")}
          </span>
        ) : (
          <span className="text-xs text-muted">Nessuna scadenza</span>
        )}
        <AvatarGroup users={task.task_assignees.map((relation) => relation.user)} />
      </div>
    </button>
  );
}
