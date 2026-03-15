"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Checklist } from "@/types";

export function ChecklistEditor({
  checklists,
  onCreateChecklist,
  onRenameChecklist,
  onDeleteChecklist,
  onCreateItem,
  onUpdateItem,
  onDeleteItem
}: {
  checklists: Checklist[];
  onCreateChecklist: (title: string) => Promise<void>;
  onRenameChecklist: (checklistId: string, title: string) => Promise<void>;
  onDeleteChecklist: (checklistId: string) => Promise<void>;
  onCreateItem: (checklistId: string, text: string) => Promise<void>;
  onUpdateItem: (
    itemId: string,
    patch: { text?: string; is_done?: boolean }
  ) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
}) {
  const [newChecklist, setNewChecklist] = useState("");
  const [draftItems, setDraftItems] = useState<Record<string, string>>({});

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Nuova checklist"
          value={newChecklist}
          onChange={(event) => setNewChecklist(event.target.value)}
        />
        <Button
          onClick={async () => {
            if (!newChecklist.trim()) return;
            await onCreateChecklist(newChecklist.trim());
            setNewChecklist("");
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Aggiungi
        </Button>
      </div>

      {checklists.map((checklist) => (
        <div key={checklist.id} className="rounded-panel border border-black/[0.06] bg-[#fafafa] p-4">
          <div className="mb-3 flex items-center gap-2">
            <Input
              defaultValue={checklist.title}
              onBlur={(event) => onRenameChecklist(checklist.id, event.target.value)}
            />
            <Button variant="ghost" onClick={() => onDeleteChecklist(checklist.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {checklist.checklist_items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-control bg-white px-3 py-2">
                <input
                  type="checkbox"
                  checked={item.is_done}
                  onChange={(event) =>
                    onUpdateItem(item.id, { is_done: event.target.checked })
                  }
                />
                <Input
                  defaultValue={item.text}
                  onBlur={(event) => onUpdateItem(item.id, { text: event.target.value })}
                  className="border-0 bg-transparent px-0"
                />
                <button
                  type="button"
                  className="text-muted hover:text-rose-600"
                  onClick={() => onDeleteItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Input
              placeholder="Nuova voce"
              value={draftItems[checklist.id] || ""}
              onChange={(event) =>
                setDraftItems((current) => ({
                  ...current,
                  [checklist.id]: event.target.value
                }))
              }
            />
            <Button
              variant="secondary"
              onClick={async () => {
                const value = draftItems[checklist.id]?.trim();
                if (!value) return;
                await onCreateItem(checklist.id, value);
                setDraftItems((current) => ({ ...current, [checklist.id]: "" }));
              }}
            >
              Aggiungi
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
