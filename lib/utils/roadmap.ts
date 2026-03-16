import type { List, RoadmapGoal, RoadmapPhase, Task } from "@/types";

const DONE_TOKENS = ["done", "complet", "chius", "fatto", "closed"];

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export function isTaskCompleted(task: Task, lists: List[]) {
  const listTitle = lists.find((list) => list.id === task.list_id)?.title || "";
  const normalized = normalize(listTitle);
  return DONE_TOKENS.some((token) => normalized.includes(token));
}

export function getGoalProgress(goal: RoadmapGoal, allTasks: Task[], lists: List[]) {
  const linkedTaskIds = goal.goal_tasks?.map((item) => item.task_id) || [];
  const linkedTasks = allTasks.filter((task) => linkedTaskIds.includes(task.id));
  const completedLinkedTasks = linkedTasks.filter((task) => isTaskCompleted(task, lists)).length;
  const linkedTaskPercent =
    linkedTasks.length === 0 ? 0 : Math.round((completedLinkedTasks / linkedTasks.length) * 100);

  const isDoneByTasks = linkedTasks.length > 0 && completedLinkedTasks === linkedTasks.length;
  const isCompleted = Boolean(goal.is_completed) || isDoneByTasks;
  const percent = Boolean(goal.is_completed) ? 100 : linkedTaskPercent;

  return {
    isCompleted,
    linkedTasks: linkedTasks.length,
    completedLinkedTasks,
    percent
  };
}

export function getPhaseProgress(phase: RoadmapPhase, allTasks: Task[], lists: List[]) {
  const goals = phase.roadmap_goals || [];
  if (goals.length === 0) {
    return {
      percent: 0,
      completedGoals: 0,
      goals: 0
    };
  }

  const goalProgresses = goals.map((goal) => getGoalProgress(goal, allTasks, lists));
  const score = goalProgresses.reduce((sum, current) => sum + current.percent, 0);
  const percent = Math.round(score / goals.length);
  const completedGoals = goalProgresses.filter((goal) => goal.isCompleted).length;

  return {
    percent,
    completedGoals,
    goals: goals.length
  };
}
