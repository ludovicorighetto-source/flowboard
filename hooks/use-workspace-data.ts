"use client";

import { useCallback, useEffect, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { STORAGE_BUCKET } from "@/lib/utils/constants";
import type { BoardData, Label, Priority, Profile, RoadmapPhase, Task } from "@/types";

const TASK_SELECT = `
  *,
  task_labels(label:labels(*)),
  task_assignees(user:profiles(*)),
  checklists(*, checklist_items(*)),
  task_attachments(*),
  goal_tasks(goal:roadmap_goals(*, phase:roadmap_phases(*)))
`;

const PHASE_SELECT = `
  *,
  roadmap_goals(
    *,
    goal_tasks(
      goal_id,
      task_id,
      task:tasks(id, title, priority, due_date, start_date)
    )
  )
`;

export function useWorkspaceData() {
  const [data, setData] = useState<BoardData>({
    lists: [],
    tasks: [],
    labels: [],
    users: [],
    allUsers: [],
    phases: []
  });
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    setLoading(true);
    setError(null);

    const [
      authResult,
      profilesResult,
      listsResult,
      tasksResult,
      labelsResult,
      phasesResult
    ] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("profiles").select("*").order("created_at", { ascending: true }),
      supabase.from("lists").select("*").order("position", { ascending: true }),
      supabase.from("tasks").select(TASK_SELECT).order("position", { ascending: true }),
      supabase.from("labels").select("*").order("created_at", { ascending: true }),
      supabase.from("roadmap_phases").select(PHASE_SELECT).order("position", { ascending: true })
    ]);

    const currentUserId = authResult.data.user?.id;
    const allUsers = (profilesResult.data || []) as Profile[];
    const approvedUsers = allUsers.filter((profile) => profile.is_approved);
    const current = allUsers.find((profile) => profile.id === currentUserId) || null;

    if (
      profilesResult.error ||
      listsResult.error ||
      tasksResult.error ||
      labelsResult.error ||
      phasesResult.error
    ) {
      setError(
        profilesResult.error?.message ||
          listsResult.error?.message ||
          tasksResult.error?.message ||
          labelsResult.error?.message ||
          phasesResult.error?.message ||
          "Errore nel caricamento dei dati."
      );
      setLoading(false);
      return;
    }

    setCurrentUser(current);
    setData({
      lists: (listsResult.data || []) as BoardData["lists"],
      tasks: ((tasksResult.data || []) as Task[]).map((task) => ({
        ...task,
        checklists: [...(task.checklists || [])].sort((a, b) => a.position - b.position).map(
          (checklist) => ({
            ...checklist,
            checklist_items: [...(checklist.checklist_items || [])].sort(
              (a, b) => a.position - b.position
            )
          })
        ),
        goal_tasks: task.goal_tasks || [],
        task_assignees: task.task_assignees || [],
        task_attachments: task.task_attachments || [],
        task_labels: task.task_labels || []
      })),
      labels: (labelsResult.data || []) as Label[],
      users: approvedUsers,
      allUsers,
      phases: ((phasesResult.data || []) as RoadmapPhase[]).map((phase) => ({
        ...phase,
        roadmap_goals: [...(phase.roadmap_goals || [])].sort((a, b) => a.position - b.position)
      }))
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const withRefresh = useCallback(
    async (callback: () => unknown) => {
      await callback();
      await loadData();
    },
    [loadData]
  );

  async function createList(title: string) {
    const supabase = createSupabaseBrowserClient();
    const { data: inserted } = await supabase
      .from("lists")
      .insert({
        title,
        position: data.lists.length
      })
      .select("id")
      .single<{ id: string }>();

    await loadData();
    return inserted?.id || null;
  }

  async function updateList(id: string, patch: { title?: string; position?: number }) {
    const supabase = createSupabaseBrowserClient();
    await withRefresh(() => supabase.from("lists").update(patch).eq("id", id));
  }

  async function deleteList(id: string) {
    const supabase = createSupabaseBrowserClient();
    await withRefresh(() => supabase.from("lists").delete().eq("id", id));
  }

  async function reorderLists(listIds: string[]) {
    const supabase = createSupabaseBrowserClient();
    await withRefresh(async () => {
      await Promise.all(
        listIds.map((id, index) => supabase.from("lists").update({ position: index }).eq("id", id))
      );
    });
  }

  async function createTask(listId: string, title: string) {
    const supabase = createSupabaseBrowserClient();
    const listTasks = data.tasks.filter((task) => task.list_id === listId);

    await withRefresh(() =>
      supabase.from("tasks").insert({
        title,
        list_id: listId,
        position: listTasks.length,
        priority: "medium",
        created_by: currentUser?.id
      })
    );
  }

  async function updateTask(
    taskId: string,
    patch: Partial<{
      title: string;
      description: string | null;
      list_id: string;
      position: number;
      priority: Priority;
      start_date: string | null;
      due_date: string | null;
      notes: string | null;
    }>
  ) {
    const supabase = createSupabaseBrowserClient();
    await withRefresh(() => supabase.from("tasks").update(patch).eq("id", taskId));
  }

  async function deleteTask(taskId: string) {
    const supabase = createSupabaseBrowserClient();
    await withRefresh(() => supabase.from("tasks").delete().eq("id", taskId));
  }

  async function moveTask(
    taskId: string,
    destinationListId: string,
    sourceTaskIds: string[],
    destinationTaskIds: string[]
  ) {
    const supabase = createSupabaseBrowserClient();
    await withRefresh(async () => {
      await Promise.all([
        ...sourceTaskIds.map((id, index) =>
          supabase
            .from("tasks")
            .update({ position: index })
            .eq("id", id)
        ),
        ...destinationTaskIds.map((id, index) =>
          supabase
            .from("tasks")
            .update({ list_id: destinationListId, position: index })
            .eq("id", id)
        ),
        supabase
          .from("tasks")
          .update({ list_id: destinationListId, position: destinationTaskIds.indexOf(taskId) })
          .eq("id", taskId)
      ]);
    });
  }

  async function createChecklist(taskId: string, title: string) {
    const supabase = createSupabaseBrowserClient();
    const checklists = data.tasks.find((task) => task.id === taskId)?.checklists || [];
    await withRefresh(() =>
      supabase.from("checklists").insert({
        task_id: taskId,
        title,
        position: checklists.length
      })
    );
  }

  async function updateChecklist(id: string, patch: { title?: string; position?: number }) {
    const supabase = createSupabaseBrowserClient();
    await withRefresh(() => supabase.from("checklists").update(patch).eq("id", id));
  }

  async function deleteChecklist(id: string) {
    const supabase = createSupabaseBrowserClient();
    await withRefresh(() => supabase.from("checklists").delete().eq("id", id));
  }

  async function createChecklistItem(checklistId: string, text: string) {
    const supabase = createSupabaseBrowserClient();
    const targetChecklist = data.tasks
      .flatMap((task) => task.checklists)
      .find((checklist) => checklist.id === checklistId);

    await withRefresh(() =>
      supabase.from("checklist_items").insert({
        checklist_id: checklistId,
        text,
        is_done: false,
        position: targetChecklist?.checklist_items.length || 0
      })
    );
  }

  async function updateChecklistItem(
    id: string,
    patch: { text?: string; is_done?: boolean; position?: number }
  ) {
    const supabase = createSupabaseBrowserClient();
    await withRefresh(() => supabase.from("checklist_items").update(patch).eq("id", id));
  }

  async function deleteChecklistItem(id: string) {
    const supabase = createSupabaseBrowserClient();
    await withRefresh(() => supabase.from("checklist_items").delete().eq("id", id));
  }

  async function createLabel(name: string, color: string) {
    const supabase = createSupabaseBrowserClient();
    const result = await supabase
      .from("labels")
      .insert({
        name,
        color,
        created_by: currentUser?.id
      })
      .select("*")
      .single<Label>();

    await loadData();
    return result.data || null;
  }

  async function setTaskLabels(taskId: string, labelIds: string[]) {
    const supabase = createSupabaseBrowserClient();
    const currentLabelIds =
      data.tasks
        .find((task) => task.id === taskId)
        ?.task_labels.map((relation) => relation.label.id) || [];

    const toDelete = currentLabelIds.filter((labelId) => !labelIds.includes(labelId));
    const toInsert = labelIds.filter((labelId) => !currentLabelIds.includes(labelId));

    await withRefresh(async () => {
      if (toDelete.length) {
        await supabase
          .from("task_labels")
          .delete()
          .eq("task_id", taskId)
          .in("label_id", toDelete);
      }

      if (toInsert.length) {
        await supabase.from("task_labels").insert(
          toInsert.map((labelId) => ({
            task_id: taskId,
            label_id: labelId
          }))
        );
      }
    });
  }

  async function setTaskAssignees(taskId: string, userIds: string[]) {
    const supabase = createSupabaseBrowserClient();
    const currentUserIds =
      data.tasks
        .find((task) => task.id === taskId)
        ?.task_assignees.map((relation) => relation.user.id) || [];

    const toDelete = currentUserIds.filter((userId) => !userIds.includes(userId));
    const toInsert = userIds.filter((userId) => !currentUserIds.includes(userId));

    await withRefresh(async () => {
      if (toDelete.length) {
        await supabase
          .from("task_assignees")
          .delete()
          .eq("task_id", taskId)
          .in("user_id", toDelete);
      }

      if (toInsert.length) {
        await supabase.from("task_assignees").insert(
          toInsert.map((userId) => ({
            task_id: taskId,
            user_id: userId
          }))
        );
      }
    });
  }

  async function setTaskGoal(taskId: string, goalId: string | null) {
    const supabase = createSupabaseBrowserClient();

    await withRefresh(async () => {
      await supabase.from("goal_tasks").delete().eq("task_id", taskId);
      if (goalId) {
        await supabase.from("goal_tasks").insert({
          goal_id: goalId,
          task_id: taskId
        });
      }
    });
  }

  async function addAttachmentLink(taskId: string, name: string, url: string) {
    const supabase = createSupabaseBrowserClient();
    await withRefresh(() =>
      supabase.from("task_attachments").insert({
        task_id: taskId,
        type: "link",
        name,
        url,
        created_by: currentUser?.id
      })
    );
  }

  async function uploadAttachmentFile(taskId: string, file: File) {
    const supabase = createSupabaseBrowserClient();
    const path = `${taskId}/${crypto.randomUUID()}-${file.name}`;
    const upload = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
      upsert: false
    });

    if (upload.error) throw upload.error;

    const publicUrl = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;

    await withRefresh(() =>
      supabase.from("task_attachments").insert({
        task_id: taskId,
        type: "file",
        name: file.name,
        url: publicUrl,
        created_by: currentUser?.id
      })
    );
  }

  async function deleteAttachment(id: string, url: string) {
    const supabase = createSupabaseBrowserClient();
    const bucketUrlPart = `${STORAGE_BUCKET}/`;
    const path = url.includes(bucketUrlPart) ? url.split(bucketUrlPart)[1] : null;

    await withRefresh(async () => {
      if (path) {
        await supabase.storage.from(STORAGE_BUCKET).remove([decodeURIComponent(path)]);
      }
      await supabase.from("task_attachments").delete().eq("id", id);
    });
  }

  async function createPhase(title: string, color: string) {
    const supabase = createSupabaseBrowserClient();
    await withRefresh(() =>
      supabase.from("roadmap_phases").insert({
        title,
        color,
        position: data.phases.length
      })
    );
  }

  async function updatePhase(
    id: string,
    patch: { title?: string; description?: string | null; color?: string; position?: number }
  ) {
    const supabase = createSupabaseBrowserClient();
    await withRefresh(() => supabase.from("roadmap_phases").update(patch).eq("id", id));
  }

  async function deletePhase(id: string) {
    const supabase = createSupabaseBrowserClient();
    await withRefresh(() => supabase.from("roadmap_phases").delete().eq("id", id));
  }

  async function createGoal(phaseId: string, title: string) {
    const supabase = createSupabaseBrowserClient();
    const goals = data.phases.find((phase) => phase.id === phaseId)?.roadmap_goals || [];
    await withRefresh(() =>
      supabase.from("roadmap_goals").insert({
        phase_id: phaseId,
        title,
        position: goals.length
      })
    );
  }

  async function updateGoal(
    id: string,
    patch: { title?: string; description?: string | null; position?: number }
  ) {
    const supabase = createSupabaseBrowserClient();
    await withRefresh(() => supabase.from("roadmap_goals").update(patch).eq("id", id));
  }

  async function deleteGoal(id: string) {
    const supabase = createSupabaseBrowserClient();
    await withRefresh(() => supabase.from("roadmap_goals").delete().eq("id", id));
  }

  async function setGoalTasks(goalId: string, taskIds: string[]) {
    const supabase = createSupabaseBrowserClient();
    const currentTaskIds =
      data.phases
        .flatMap((phase) => phase.roadmap_goals || [])
        .find((goal) => goal.id === goalId)
        ?.goal_tasks?.map((goalTask) => goalTask.task_id) || [];

    const toDelete = currentTaskIds.filter((taskId) => !taskIds.includes(taskId));
    const toInsert = taskIds.filter((taskId) => !currentTaskIds.includes(taskId));

    await withRefresh(async () => {
      if (toDelete.length) {
        await supabase
          .from("goal_tasks")
          .delete()
          .eq("goal_id", goalId)
          .in("task_id", toDelete);
      }

      if (toInsert.length) {
        await supabase.from("goal_tasks").insert(
          toInsert.map((taskId) => ({
            goal_id: goalId,
            task_id: taskId
          }))
        );
      }
    });
  }

  async function setUserApproval(userId: string, isApproved: boolean) {
    const supabase = createSupabaseBrowserClient();
    await withRefresh(() =>
      supabase.from("profiles").update({ is_approved: isApproved }).eq("id", userId)
    );
  }

  return {
    data,
    currentUser,
    loading,
    error,
    reload: loadData,
    createList,
    updateList,
    deleteList,
    reorderLists,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    createChecklist,
    updateChecklist,
    deleteChecklist,
    createChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    createLabel,
    setTaskLabels,
    setTaskAssignees,
    setTaskGoal,
    addAttachmentLink,
    uploadAttachmentFile,
    deleteAttachment,
    createPhase,
    updatePhase,
    deletePhase,
    createGoal,
    updateGoal,
    deleteGoal,
    setGoalTasks,
    setUserApproval
  };
}
