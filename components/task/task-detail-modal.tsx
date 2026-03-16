"use client";

import { useEffect, useMemo, useState } from "react";

import { AssigneeSelector } from "@/components/task/assignee-selector";
import { ChecklistEditor } from "@/components/task/checklist-editor";
import { LabelSelector } from "@/components/task/label-selector";
import { TaskDatePicker } from "@/components/task/task-date-picker";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PRIORITY_META } from "@/lib/utils/constants";
import { getChecklistProgress } from "@/lib/utils/task";
import type { BoardData, Label, Task } from "@/types";

type ModalActions = {
  updateTask: (
    taskId: string,
    patch: Partial<{
      title: string;
      description: string | null;
      list_id: string;
      position: number;
      priority: "low" | "medium" | "high";
      start_date: string | null;
      due_date: string | null;
      notes: string | null;
    }>
  ) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  createChecklist: (taskId: string, title: string) => Promise<void>;
  updateChecklist: (checklistId: string, patch: { title?: string }) => Promise<void>;
  deleteChecklist: (checklistId: string) => Promise<void>;
  createChecklistItem: (checklistId: string, text: string) => Promise<void>;
  updateChecklistItem: (
    itemId: string,
    patch: { text?: string; is_done?: boolean }
  ) => Promise<void>;
  deleteChecklistItem: (itemId: string) => Promise<void>;
  setTaskLabels: (taskId: string, labelIds: string[]) => Promise<void>;
  createLabel: (name: string, color: string) => Promise<Label | null>;
  setTaskAssignees: (taskId: string, userIds: string[]) => Promise<void>;
  setTaskGoal: (taskId: string, goalId: string | null) => Promise<void>;
  addAttachmentLink: (taskId: string, name: string, url: string) => Promise<void>;
  uploadAttachmentFile: (taskId: string, file: File) => Promise<void>;
  deleteAttachment: (id: string, url: string) => Promise<void>;
};

export function TaskDetailModal({
  open,
  task,
  data,
  actions,
  onClose
}: {
  open: boolean;
  task: Task | null;
  data: BoardData;
  actions: ModalActions;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [notes, setNotes] = useState(task?.notes || "");
  const [showDelete, setShowDelete] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<{
    id: string;
    url: string;
    name: string;
  } | null>(null);
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [phaseId, setPhaseId] = useState(task?.goal_tasks[0]?.goal?.phase_id || "");
  const [goalId, setGoalId] = useState(task?.goal_tasks[0]?.goal?.id || "");

  useEffect(() => {
    setTitle(task?.title || "");
    setDescription(task?.description || "");
    setNotes(task?.notes || "");
    setPhaseId(task?.goal_tasks[0]?.goal?.phase_id || "");
    setGoalId(task?.goal_tasks[0]?.goal?.id || "");
  }, [task]);

  useEffect(() => {
    if (!task) return;
    const timer = window.setTimeout(() => {
      if (
        title !== task.title ||
        description !== (task.description || "") ||
        notes !== (task.notes || "")
      ) {
        void actions.updateTask(task.id, {
          title,
          description: description || null,
          notes: notes || null
        });
      }
    }, 600);

    return () => window.clearTimeout(timer);
  }, [actions, description, notes, task, title]);

  const checklistProgress = useMemo(
    () => getChecklistProgress(task?.checklists || []),
    [task?.checklists]
  );

  if (!task) return null;

  const selectedLabelIds = task.task_labels.map((item) => item.label.id);
  const selectedUserIds = task.task_assignees.map((item) => item.user.id);
  const availableGoals = data.phases
    .find((phase) => phase.id === phaseId)
    ?.roadmap_goals || [];

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Dettaglio task"
        className="max-w-6xl"
        mobileSheet
      >
        <div className="grid gap-0 lg:grid-cols-[1.35fr_0.8fr]">
          <div className="space-y-6 border-b border-black/[0.06] p-5 lg:border-b-0 lg:border-r">
            <div className="space-y-3">
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="h-12 border-black/[0.08] text-lg font-semibold"
              />
              <p className="text-sm text-muted">
                Lista: {data.lists.find((list) => list.id === task.list_id)?.title || "Senza lista"}
              </p>
            </div>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                Descrizione
              </h3>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Aggiungi una descrizione..."
              />
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                  Checklist
                </h3>
                <span className="text-sm text-muted">
                  {checklistProgress.completed}/{checklistProgress.total} completate
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/[0.06]">
                <div
                  className="h-full rounded-full bg-action"
                  style={{ width: `${checklistProgress.percent}%` }}
                />
              </div>
              <ChecklistEditor
                checklists={task.checklists}
                onCreateChecklist={(value) => actions.createChecklist(task.id, value)}
                onRenameChecklist={(checklistId, value) =>
                  actions.updateChecklist(checklistId, { title: value })
                }
                onDeleteChecklist={actions.deleteChecklist}
                onCreateItem={actions.createChecklistItem}
                onUpdateItem={actions.updateChecklistItem}
                onDeleteItem={actions.deleteChecklistItem}
              />
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                Note
              </h3>
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Aggiungi note libere..."
              />
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                Allegati
              </h3>
              <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                <Input
                  value={linkName}
                  onChange={(event) => setLinkName(event.target.value)}
                  placeholder="Nome link"
                />
                <Input
                  value={linkUrl}
                  onChange={(event) => setLinkUrl(event.target.value)}
                  placeholder="https://..."
                />
                <Button
                  variant="secondary"
                  className="w-full md:w-auto"
                  onClick={async () => {
                    if (!linkName.trim() || !linkUrl.trim()) return;
                    await actions.addAttachmentLink(task.id, linkName.trim(), linkUrl.trim());
                    setLinkName("");
                    setLinkUrl("");
                  }}
                >
                  Aggiungi link
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-3 text-sm font-medium text-ink md:w-auto">
                  <span>Carica file</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      await actions.uploadAttachmentFile(task.id, file);
                      event.target.value = "";
                    }}
                  />
                </label>
              </div>
              <div className="space-y-2">
                {task.task_attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex flex-col gap-2 rounded-xl border border-black/[0.06] bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-action"
                    >
                      {attachment.name}
                    </a>
                    <Button
                      variant="ghost"
                      className="w-full sm:w-auto"
                      onClick={() =>
                        setAttachmentToDelete({
                          id: attachment.id,
                          url: attachment.url,
                          name: attachment.name
                        })
                      }
                    >
                      Elimina
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6 p-5">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                Sposta task
              </h3>
              <Select
                value={task.list_id}
                onChange={(event) => {
                  const nextListId = event.target.value;
                  const nextPosition = data.tasks.filter((item) => item.list_id === nextListId).length;
                  void actions.updateTask(task.id, { list_id: nextListId, position: nextPosition });
                }}
              >
                {data.lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.title}
                  </option>
                ))}
              </Select>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                Label
              </h3>
              <LabelSelector
                labels={data.labels}
                selectedIds={selectedLabelIds}
                onChange={(ids) => actions.setTaskLabels(task.id, ids)}
                onCreate={async (name, color) => {
                  const created = await actions.createLabel(name, color);
                  if (created) {
                    await actions.setTaskLabels(task.id, [...selectedLabelIds, created.id]);
                  }
                }}
              />
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                Assegnati
              </h3>
              <AssigneeSelector
                users={data.users}
                selectedIds={selectedUserIds}
                onChange={(ids) => actions.setTaskAssignees(task.id, ids)}
              />
            </section>

            <section className="space-y-3">
              <TaskDatePicker
                label="Data inizio"
                value={task.start_date}
                onChange={(value) => actions.updateTask(task.id, { start_date: value })}
              />
              <TaskDatePicker
                label="Scadenza"
                value={task.due_date}
                onChange={(value) => actions.updateTask(task.id, { due_date: value })}
              />
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                Priorità
              </h3>
              <div className="grid gap-2">
                {Object.entries(PRIORITY_META).map(([value, meta]) => (
                  <button
                    key={value}
                    type="button"
                    className={`min-h-12 rounded-xl border px-4 py-3 text-left text-sm font-medium ${
                      task.priority === value
                        ? meta.className
                        : "border-black/[0.08] bg-white text-muted"
                    }`}
                    onClick={() =>
                      actions.updateTask(task.id, {
                        priority: value as "low" | "medium" | "high"
                      })
                    }
                  >
                    {meta.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                Collega alla roadmap
              </h3>
              <Select
                value={phaseId}
                onChange={(event) => {
                  setPhaseId(event.target.value);
                  setGoalId("");
                  void actions.setTaskGoal(task.id, null);
                }}
              >
                <option value="">Seleziona una fase</option>
                {data.phases.map((phase) => (
                  <option key={phase.id} value={phase.id}>
                    {phase.title}
                  </option>
                ))}
              </Select>
              <Select
                value={goalId}
                onChange={(event) => {
                  setGoalId(event.target.value);
                  void actions.setTaskGoal(task.id, event.target.value || null);
                }}
              >
                <option value="">Nessun goal collegato</option>
                {availableGoals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </Select>
            </section>

            <div className="border-t border-black/[0.06] pt-5">
              <Button variant="danger" className="w-full" onClick={() => setShowDelete(true)}>
                Elimina task
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Eliminare questo task?"
        description="Questa azione rimuovera task, checklist, allegati e collegamenti associati."
        confirmLabel="Elimina"
        onConfirm={async () => {
          await actions.deleteTask(task.id);
          setShowDelete(false);
          onClose();
        }}
      />

      <ConfirmDialog
        open={Boolean(attachmentToDelete)}
        onClose={() => setAttachmentToDelete(null)}
        title="Eliminare questo allegato?"
        description={
          attachmentToDelete
            ? `L'allegato "${attachmentToDelete.name}" verra rimosso dal task.`
            : "L'allegato verra rimosso dal task."
        }
        confirmLabel="Elimina allegato"
        onConfirm={async () => {
          if (!attachmentToDelete) return;
          await actions.deleteAttachment(attachmentToDelete.id, attachmentToDelete.url);
          setAttachmentToDelete(null);
        }}
      />
    </>
  );
}
