"use client";

import { format, isBefore, parseISO } from "date-fns";

import { AvatarGroup } from "@/components/ui/avatar-group";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_META } from "@/lib/utils/constants";
import type { Task } from "@/types";

export function DueSoonPanel({
  tasks,
  onTaskClick
}: {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}) {
  return (
    <div className="panel h-full p-5">
      <div className="mb-4 space-y-1">
        <h3 className="text-xl font-semibold text-ink">In scadenza</h3>
        <p className="text-sm text-muted">Task in scadenza entro i prossimi 7 giorni.</p>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-panel border border-dashed border-black/[0.1] px-4 py-8 text-center text-sm text-muted">
            Nessun task in scadenza.
          </div>
        ) : (
          tasks.map((task) => {
            const overdue = task.due_date ? isBefore(parseISO(task.due_date), new Date()) : false;
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => onTaskClick(task)}
                className={`w-full rounded-panel border px-4 py-3 text-left transition hover:shadow-soft ${
                  overdue
                    ? "border-rose-200 bg-rose-50"
                    : "border-black/[0.06] bg-white"
                }`}
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">{task.title}</p>
                  <Badge className={PRIORITY_META[task.priority].className}>
                    {PRIORITY_META[task.priority].label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-xs ${overdue ? "text-rose-700" : "text-muted"}`}>
                    {task.due_date ? format(parseISO(task.due_date), "dd MMM yyyy") : "Senza data"}
                  </span>
                  <AvatarGroup users={task.task_assignees.map((item) => item.user)} />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
