"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { TaskCard } from "@/components/board/task-card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { getListColorClass } from "@/lib/utils/constants";
import type { List, Task } from "@/types";

export function BoardListColumn({
  list,
  tasks,
  compact,
  onTaskClick,
  onRenameList,
  onDeleteList,
  onCreateTask,
  shouldFocusTitle = false
}: {
  list: List;
  tasks: Task[];
  compact: boolean;
  onTaskClick: (task: Task) => void;
  onRenameList: (listId: string, title: string) => Promise<void>;
  onDeleteList: (listId: string) => Promise<void>;
  onCreateTask: (listId: string, title: string) => Promise<void>;
  shouldFocusTitle?: boolean;
}) {
  const [title, setTitle] = useState(list.title);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const listColorClass = getListColorClass(list.title, list.position);

  useEffect(() => {
    setTitle(list.title);
  }, [list.title]);

  useEffect(() => {
    if (!shouldFocusTitle) return;
    titleInputRef.current?.focus();
    titleInputRef.current?.select();
  }, [shouldFocusTitle]);

  return (
    <>
      <div className={`panel flex h-full flex-col ${compact ? "w-[220px]" : "w-[320px]"} p-3`}>
        <div className="mb-3 flex items-center gap-2">
          <Input
            ref={titleInputRef}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => onRenameList(list.id, title)}
            className="min-h-12 border-0 bg-transparent px-1 text-base font-semibold"
          />
          <div className="flex items-center gap-1">
            <Button variant="ghost" onClick={() => setShowComposer((current) => !current)}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showComposer ? (
          <div className="mb-3 space-y-2 rounded-panel border border-black/[0.06] bg-[#fafafa] p-3">
            <Input
              value={newTaskTitle}
              onChange={(event) => setNewTaskTitle(event.target.value)}
              placeholder="Titolo nuovo task"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowComposer(false)}>
                Chiudi
              </Button>
              <Button
                onClick={async () => {
                  if (!newTaskTitle.trim()) return;
                  await onCreateTask(list.id, newTaskTitle.trim());
                  setNewTaskTitle("");
                  setShowComposer(false);
                }}
              >
                Crea task
              </Button>
            </div>
          </div>
        ) : null}

        <Droppable droppableId={list.id}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="subtle-scrollbar flex min-h-[180px] flex-1 flex-col gap-2 overflow-y-auto pr-1"
            >
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(draggableProvided) => (
                    <div
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      {...draggableProvided.dragHandleProps}
                    >
                      <TaskCard
                        task={task}
                        compact={compact}
                        listColorClass={listColorClass}
                        onClick={() => onTaskClick(task)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Eliminare questa lista?"
        description="La lista verra eliminata insieme a tutti i task contenuti."
        confirmLabel="Elimina lista"
        onConfirm={async () => {
          await onDeleteList(list.id);
          setShowDeleteConfirm(false);
        }}
      />
    </>
  );
}
