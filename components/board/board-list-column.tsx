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
  const overviewReadOnlyTitle = compact && !shouldFocusTitle;

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
      <div className={`panel flex h-full flex-col ${compact ? "w-[250px]" : "w-[320px]"} p-3`}>
        <div className="mb-3 flex items-center gap-2">
          <div className="min-w-0 flex-1">
            {overviewReadOnlyTitle ? (
              <p className="line-clamp-2 break-words px-1 text-sm font-semibold leading-5 text-ink">
                {list.title}
              </p>
            ) : (
              <Input
                ref={titleInputRef}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onBlur={() => onRenameList(list.id, title)}
                className={`border-0 bg-transparent px-1 font-semibold ${
                  compact ? "min-h-10 text-sm" : "min-h-12 text-base"
                }`}
              />
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              className={compact ? "min-h-9 min-w-9 px-2 py-2" : ""}
              onClick={() => setShowComposer((current) => !current)}
            >
              <Plus className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
            </Button>
            {!compact ? (
              <>
                <Button
                  variant="ghost"
                  className={compact ? "min-h-9 min-w-9 px-2 py-2" : ""}
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
                </Button>
                <Button variant="ghost" className={compact ? "min-h-9 min-w-9 px-2 py-2" : ""}>
                  <MoreHorizontal className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
                </Button>
              </>
            ) : null}
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
            className={`subtle-scrollbar flex flex-1 flex-col gap-2 overflow-y-auto pr-1 ${
              compact ? "min-h-[140px]" : "min-h-[180px]"
            }`}
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
