"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LABEL_COLORS } from "@/lib/utils/constants";
import type { Label } from "@/types";

export function LabelSelector({
  labels,
  selectedIds,
  onChange,
  onCreate
}: {
  labels: Label[];
  selectedIds: string[];
  onChange: (ids: string[]) => Promise<void>;
  onCreate: (name: string, color: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(LABEL_COLORS[0]);

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        {labels.map((label) => {
          const checked = selectedIds.includes(label.id);
          return (
            <label
              key={label.id}
              className="flex cursor-pointer items-center justify-between rounded-control border border-black/[0.06] bg-white px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: label.color }}
                />
                <span className="text-sm text-ink">{label.name}</span>
              </div>
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => {
                  const next = event.target.checked
                    ? [...selectedIds, label.id]
                    : selectedIds.filter((id) => id !== label.id);
                  void onChange(next);
                }}
              />
            </label>
          );
        })}
      </div>

      <div className="rounded-panel border border-black/[0.06] bg-[#fafafa] p-3">
        <p className="mb-2 text-sm font-medium text-ink">Nuova label</p>
        <div className="space-y-3">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome label"
          />
          <div className="grid grid-cols-6 gap-2">
            {LABEL_COLORS.map((item) => (
              <button
                key={item}
                type="button"
                className={`h-8 rounded-control border ${
                  color === item ? "border-ink" : "border-black/[0.08]"
                }`}
                style={{ backgroundColor: item }}
                onClick={() => setColor(item)}
                aria-label={`Seleziona colore ${item}`}
              />
            ))}
          </div>
          <Button
            variant="secondary"
            className="w-full"
            onClick={async () => {
              if (!name.trim()) return;
              await onCreate(name.trim(), color);
              setName("");
            }}
          >
            Crea label
          </Button>
        </div>
      </div>
    </div>
  );
}
