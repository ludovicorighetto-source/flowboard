import { addDays, format, isAfter, isBefore, parseISO } from "date-fns";

import type { Checklist, Task } from "@/types";

export function getChecklistProgress(checklists: Checklist[]) {
  const items = checklists.flatMap((checklist) => checklist.checklist_items || []);
  const total = items.length;
  const completed = items.filter((item) => item.is_done).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, percent };
}

export function getTaskColor(task: Task) {
  return task.task_labels[0]?.label.color || "#0071e3";
}

export function isTaskInRange(task: Task, day: Date) {
  if (!task.start_date || !task.due_date) return false;
  const start = parseISO(task.start_date);
  const end = parseISO(task.due_date);

  return !isBefore(day, start) && !isAfter(day, end);
}

export function getTaskDurationLabel(task: Task) {
  if (!task.start_date || !task.due_date) return null;
  return `${format(parseISO(task.start_date), "d MMM")} - ${format(
    parseISO(task.due_date),
    "d MMM"
  )}`;
}

export function isTaskDueSoon(task: Task) {
  if (!task.due_date) return false;
  const due = parseISO(task.due_date);
  return !isAfter(due, addDays(new Date(), 7));
}
