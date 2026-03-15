export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Priority = "low" | "medium" | "high";
export type AttachmentType = "file" | "link";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  is_approved: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  created_by: string;
  created_at: string;
}

export interface List {
  id: string;
  title: string;
  position: number;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  text: string;
  is_done: boolean;
  position: number;
}

export interface Checklist {
  id: string;
  task_id: string;
  title: string;
  position: number;
  checklist_items: ChecklistItem[];
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  type: AttachmentType;
  name: string;
  url: string;
  created_by: string;
  created_at: string;
}

export interface RoadmapPhase {
  id: string;
  title: string;
  description: string | null;
  color: string;
  position: number;
  created_at: string;
  roadmap_goals?: RoadmapGoal[];
}

export interface RoadmapGoal {
  id: string;
  phase_id: string;
  title: string;
  description: string | null;
  position: number;
  created_at: string;
  goal_tasks?: GoalTask[];
}

export interface GoalTask {
  goal_id: string;
  task_id: string;
  task?: Task;
}

export interface TaskLabelRelation {
  label: Label;
}

export interface TaskAssigneeRelation {
  user: Profile;
}

export interface TaskGoalRelation {
  goal: RoadmapGoal & { phase?: RoadmapPhase };
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  list_id: string;
  position: number;
  priority: Priority;
  start_date: string | null;
  due_date: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  task_labels: TaskLabelRelation[];
  task_assignees: TaskAssigneeRelation[];
  checklists: Checklist[];
  task_attachments: TaskAttachment[];
  goal_tasks: TaskGoalRelation[];
}

export interface BoardData {
  lists: List[];
  tasks: Task[];
  labels: Label[];
  users: Profile[];
  allUsers: Profile[];
  phases: RoadmapPhase[];
}
