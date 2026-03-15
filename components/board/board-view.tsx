"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { LayoutGrid, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { BoardListColumn } from "@/components/board/board-list-column";
import { AppHeader } from "@/components/layout/app-header";
import { TaskDetailModal } from "@/components/task/task-detail-modal";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useWorkspaceData } from "@/hooks/use-workspace-data";
import type { Task } from "@/types";

export function BoardView() {
  const workspace = useWorkspaceData();
  const [compact, setCompact] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const tasksByList = useMemo(() => {
    return workspace.data.lists.reduce<Record<string, Task[]>>((acc, list) => {
      acc[list.id] = workspace.data.tasks
        .filter((task) => task.list_id === list.id)
        .sort((a, b) => a.position - b.position);
      return acc;
    }, {});
  }, [workspace.data.lists, workspace.data.tasks]);

  async function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceTasks = [...(tasksByList[source.droppableId] || [])];
    const destinationTasks =
      source.droppableId === destination.droppableId
        ? sourceTasks
        : [...(tasksByList[destination.droppableId] || [])];

    const [moved] = sourceTasks.splice(source.index, 1);
    destinationTasks.splice(destination.index, 0, moved);

    await workspace.moveTask(
      draggableId,
      destination.droppableId,
      sourceTasks.map((task) => task.id),
      destinationTasks.map((task) => task.id)
    );
  }

  if (workspace.loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-20 w-full" />
        <div className="grid gap-4 lg:grid-cols-3">
          <LoadingSkeleton className="h-[420px]" />
          <LoadingSkeleton className="h-[420px]" />
          <LoadingSkeleton className="h-[420px]" />
        </div>
      </div>
    );
  }

  if (workspace.error) {
    return (
      <EmptyState
        title="Impossibile caricare la board"
        description={workspace.error}
        actionLabel="Riprova"
        onAction={() => void workspace.reload()}
      />
    );
  }

  return (
    <div>
      <AppHeader
        title="Board"
        description="Gestisci task, priorita, checklist e assegnazioni in una kanban board pulita e veloce."
        actions={
          <>
            <Button variant="secondary" onClick={() => setCompact((current) => !current)}>
              <LayoutGrid className="mr-2 h-4 w-4" />
              {compact ? "Vista standard" : "Vista totale"}
            </Button>
            <Button onClick={() => void workspace.createList(`Nuova lista ${workspace.data.lists.length + 1}`)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuova lista
            </Button>
          </>
        }
      />

      {workspace.data.lists.length === 0 ? (
        <EmptyState
          title="La board e vuota"
          description="Crea la prima lista per iniziare a organizzare lavoro, roadmap e scadenze."
          actionLabel="Crea prima lista"
          onAction={() => void workspace.createList("To do")}
        />
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="subtle-scrollbar flex gap-4 overflow-x-auto pb-4">
            {workspace.data.lists.map((list) => (
              <BoardListColumn
                key={list.id}
                list={list}
                tasks={tasksByList[list.id] || []}
                compact={compact}
                onTaskClick={(task) => setSelectedTask(task)}
                onRenameList={(listId, title) => workspace.updateList(listId, { title })}
                onDeleteList={workspace.deleteList}
                onCreateTask={workspace.createTask}
              />
            ))}
          </div>
        </DragDropContext>
      )}

      <TaskDetailModal
        open={Boolean(selectedTask)}
        task={
          selectedTask
            ? workspace.data.tasks.find((task) => task.id === selectedTask.id) || selectedTask
            : null
        }
        data={workspace.data}
        onClose={() => setSelectedTask(null)}
        actions={workspace}
      />
    </div>
  );
}
