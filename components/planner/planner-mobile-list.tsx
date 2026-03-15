"use client";

import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  parseISO,
  startOfMonth
} from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRIORITY_META } from "@/lib/utils/constants";
import { getTaskColor, isTaskInRange } from "@/lib/utils/task";
import type { Task } from "@/types";

export function PlannerMobileList({
  currentMonth,
  tasks,
  onPrevMonth,
  onNextMonth,
  onTaskClick
}: {
  currentMonth: Date;
  tasks: Task[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onTaskClick: (task: Task) => void;
}) {
  const [openDateKeys, setOpenDateKeys] = useState<Record<string, boolean>>({});

  const grouped = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    return days
      .map((day) => {
        const dayTasks = tasks.filter((task) => isTaskInRange(task, day));
        return {
          day,
          key: format(day, "yyyy-MM-dd"),
          tasks: dayTasks
        };
      })
      .filter((entry) => entry.tasks.length > 0);
  }, [currentMonth, tasks]);

  return (
    <div className="panel space-y-4 p-4 lg:hidden">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-ink">{format(currentMonth, "MMMM yyyy")}</h3>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onPrevMonth}>
            Prec
          </Button>
          <Button variant="secondary" onClick={onNextMonth}>
            Succ
          </Button>
        </div>
      </div>

      {grouped.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/[0.1] px-4 py-5 text-sm text-muted">
          Nessun task pianificato nel mese selezionato.
        </p>
      ) : (
        <div className="space-y-3">
          {grouped.map((group) => {
            const isOpen = openDateKeys[group.key] ?? isSameDay(group.day, new Date());
            return (
              <div key={group.key} className="rounded-xl border border-black/[0.08] bg-white">
                <button
                  type="button"
                  className="focus-ring flex min-h-12 w-full items-center justify-between rounded-xl px-4 py-3 text-left"
                  onClick={() =>
                    setOpenDateKeys((current) => ({
                      ...current,
                      [group.key]: !isOpen
                    }))
                  }
                >
                  <span className="text-sm font-semibold text-ink">
                    {format(group.day, "EEEE d MMM")} ({group.tasks.length})
                  </span>
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {isOpen ? (
                  <div className="space-y-2 border-t border-black/[0.06] p-3">
                    {group.tasks.map((task) => (
                      <button
                        key={`${group.key}-${task.id}`}
                        type="button"
                        onClick={() => onTaskClick(task)}
                        className="focus-ring w-full rounded-xl border border-black/[0.06] bg-white px-3 py-3 text-left"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-ink">{task.title}</p>
                          <Badge className={PRIORITY_META[task.priority].className}>
                            {PRIORITY_META[task.priority].label}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted">
                            {task.start_date && task.due_date
                              ? `${format(parseISO(task.start_date), "dd/MM")} - ${format(
                                  parseISO(task.due_date),
                                  "dd/MM"
                                )}`
                              : "Senza intervallo"}
                          </span>
                          <span
                            className="h-2 w-10 rounded-full"
                            style={{ backgroundColor: getTaskColor(task) }}
                            aria-hidden="true"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
