"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { generateSmartTaskDraft } from "@/lib/utils/describe-and-create";
import type { Priority } from "@/types";

type DraftState = {
  title: string;
  description: string;
  priority: Priority;
  due_date: string | null;
  checklistText: string;
};

export function DescribeAndCreateTaskModal({
  open,
  onClose,
  onCreateTask
}: {
  open: boolean;
  onClose: () => void;
  onCreateTask: (payload: {
    title: string;
    description: string;
    priority: Priority;
    due_date: string | null;
    checklist: string[];
  }) => Promise<void>;
}) {
  const [sourceText, setSourceText] = useState("");
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [saving, setSaving] = useState(false);

  const canGenerate = sourceText.trim().length > 0;
  const checklistItems = useMemo(
    () =>
      (draft?.checklistText || "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    [draft?.checklistText]
  );

  return (
    <Modal open={open} onClose={onClose} title="Descrivi e crea" className="max-w-2xl" mobileSheet>
      <div className="space-y-4 p-5">
        {!draft ? (
          <>
            <Textarea
              value={sourceText}
              onChange={(event) => setSourceText(event.target.value)}
              placeholder="Es: prepara il lancio beta HairMatch entro fine mese con checklist marketing"
              className="min-h-[140px]"
            />
            <div className="flex justify-end">
              <Button
                disabled={!canGenerate}
                onClick={() => {
                  const generated = generateSmartTaskDraft(sourceText);
                  setDraft({
                    ...generated,
                    checklistText: generated.checklist.join("\n")
                  });
                }}
              >
                Genera bozza
              </Button>
            </div>
          </>
        ) : (
          <>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink">Titolo</span>
              <Input
                value={draft.title}
                onChange={(event) => setDraft((current) => (current ? { ...current, title: event.target.value } : current))}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink">Descrizione</span>
              <Textarea
                value={draft.description}
                onChange={(event) =>
                  setDraft((current) => (current ? { ...current, description: event.target.value } : current))
                }
                className="min-h-[140px]"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-ink">Priorità</span>
                <Select
                  value={draft.priority}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? { ...current, priority: event.target.value as Priority }
                        : current
                    )
                  }
                >
                  <option value="low">Bassa</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </Select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-ink">Data scadenza</span>
                <Input
                  type="date"
                  value={draft.due_date || ""}
                  onChange={(event) =>
                    setDraft((current) =>
                      current ? { ...current, due_date: event.target.value || null } : current
                    )
                  }
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink">Checklist suggerita</span>
              <Textarea
                value={draft.checklistText}
                onChange={(event) =>
                  setDraft((current) =>
                    current ? { ...current, checklistText: event.target.value } : current
                  )
                }
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted">Una voce per riga</p>
            </label>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => setDraft(null)}
                disabled={saving}
              >
                Modifica prompt
              </Button>
              <Button
                className="w-full sm:w-auto"
                onClick={async () => {
                  if (!draft.title.trim()) return;
                  setSaving(true);
                  await onCreateTask({
                    title: draft.title.trim(),
                    description: draft.description.trim(),
                    priority: draft.priority,
                    due_date: draft.due_date,
                    checklist: checklistItems
                  });
                  setSaving(false);
                  setSourceText("");
                  setDraft(null);
                  onClose();
                }}
                disabled={saving}
              >
                Crea task
              </Button>
            </div>
          </>
        )}

        {!draft ? (
          <div className="flex justify-end">
            <Button variant="ghost" onClick={onClose}>
              Annulla
            </Button>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
