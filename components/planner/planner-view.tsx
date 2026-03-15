"use client";

import { addDays } from "date-fns";
import { useMemo, useState } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { PlannerCalendar } from "@/components/planner/planner-calendar";
import { DueSoonPanel } from "@/components/planner/due-soon-panel";
import { PlannerMobileList } from "@/components/planner/planner-mobile-list";
import { TaskDetailModal } from "@/components/task/task-detail-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useWorkspaceData } from "@/hooks/use-workspace-data";
import type { Task } from "@/types";

export function PlannerView() {
  const workspace = useWorkspaceData();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const userLabel = (workspace.currentUser?.full_name || workspace.currentUser?.email || "U")
    .slice(0, 2)
    .toUpperCase();

  const plannedTasks = useMemo(
    () => workspace.data.tasks.filter((task) => task.start_date && task.due_date),
    [workspace.data.tasks]
  );

  const dueSoonTasks = useMemo(
    () =>
      workspace.data.tasks
        .filter((task) => {
          if (!task.due_date) return false;
          const due = new Date(task.due_date);
          return due <= addDays(new Date(), 7);
        })
        .sort((a, b) => (a.due_date || "").localeCompare(b.due_date || "")),
    [workspace.data.tasks]
  );

  if (workspace.loading) {
    return <LoadingSkeleton className="h-[520px] w-full" />;
  }

  if (workspace.error) {
    return (
      <EmptyState
        title="Planner non disponibile"
        description={workspace.error}
        actionLabel="Riprova"
        onAction={() => void workspace.reload()}
      />
    );
  }

  return (
    <div>
      <AppHeader
        title="Planner"
        description="Monitora task multi-day nel calendario e tieni sotto controllo le prossime scadenze."
        userLabel={userLabel}
      />

      <div className="space-y-4 lg:hidden">
        <DueSoonPanel tasks={dueSoonTasks} onTaskClick={setSelectedTask} />
        <PlannerMobileList
          currentMonth={currentMonth}
          tasks={plannedTasks}
          onPrevMonth={() =>
            setCurrentMonth((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))
          }
          onNextMonth={() =>
            setCurrentMonth((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))
          }
          onTaskClick={setSelectedTask}
        />
      </div>

      <div className="hidden gap-6 xl:grid xl:grid-cols-[1.35fr_0.65fr]">
        <PlannerCalendar
          currentMonth={currentMonth}
          tasks={plannedTasks}
          onPrevMonth={() => setCurrentMonth((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))}
          onNextMonth={() => setCurrentMonth((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))}
          onTaskClick={setSelectedTask}
        />
        <DueSoonPanel tasks={dueSoonTasks} onTaskClick={setSelectedTask} />
      </div>

      <TaskDetailModal
        open={Boolean(selectedTask)}
        task={
          selectedTask
            ? workspace.data.tasks.find((task) => task.id === selectedTask.id) || selectedTask
            : null
        }
        data={workspace.data}
        actions={workspace}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}
