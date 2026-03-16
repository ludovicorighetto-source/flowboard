"use client";

import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths
} from "date-fns";

import { Button } from "@/components/ui/button";
import { getTaskColor, isTaskInRange } from "@/lib/utils/task";
import { cn } from "@/lib/utils/cn";
import type { Task } from "@/types";

const weekLabels = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

export function PlannerCalendar({
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
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weeks = [];

  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-black/[0.06] px-3 py-3 sm:px-5 sm:py-4">
        <div>
          <h3 className="text-lg font-semibold text-ink sm:text-xl">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <p className="text-xs text-muted sm:text-sm">Vista mensile dei task con intervallo date.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onPrevMonth}>
            {format(subMonths(currentMonth, 1), "MMM")}
          </Button>
          <Button variant="secondary" onClick={onNextMonth}>
            {format(addMonths(currentMonth, 1), "MMM")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-black/[0.06] bg-[#fafafa]">
        {weekLabels.map((label) => (
          <div key={label} className="px-1.5 py-2 text-center text-[11px] font-medium text-muted sm:px-4 sm:py-3 sm:text-sm">
            {label}
          </div>
        ))}
      </div>

      <div className="grid">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b border-black/[0.04] last:border-b-0">
            {week.map((day) => {
              const dayTasks = tasks.filter((task) => isTaskInRange(task, day));
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "min-h-[96px] border-r border-black/[0.04] px-1.5 py-1.5 last:border-r-0 sm:min-h-[140px] sm:px-2 sm:py-2 lg:min-h-[160px]",
                    !isSameMonth(day, currentMonth) && "bg-black/[0.015]"
                  )}
                >
                  <div
                    className={cn(
                      "mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold sm:mb-2 sm:h-8 sm:w-8 sm:text-sm",
                      isToday(day) ? "bg-action text-white" : "text-ink"
                    )}
                  >
                    {format(day, "d")}
                  </div>

                  <div className="space-y-1">
                    {dayTasks.slice(0, 4).map((task) => {
                      const start = parseISO(task.start_date!);
                      const end = parseISO(task.due_date!);
                      const isStart = format(day, "yyyy-MM-dd") === format(start, "yyyy-MM-dd");
                      const isEnd = format(day, "yyyy-MM-dd") === format(end, "yyyy-MM-dd");

                      return (
                        <button
                          key={`${task.id}-${day.toISOString()}`}
                          type="button"
                          onClick={() => onTaskClick(task)}
                          className={cn(
                            "w-full truncate px-1 py-0.5 text-left text-[10px] font-medium text-white sm:px-2 sm:py-1 sm:text-xs",
                            isStart && "rounded-l-control",
                            isEnd && "rounded-r-control",
                            !isStart && !isEnd && "rounded-none",
                            isStart && isEnd && "rounded-control"
                          )}
                          style={{ backgroundColor: getTaskColor(task) }}
                          title={task.title}
                        >
                          {isStart ? task.title : "\u00A0"}
                        </button>
                      );
                    })}
                    {dayTasks.length > 4 ? (
                      <p className="px-1 text-[10px] text-muted sm:text-xs">+{dayTasks.length - 4} altri</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
