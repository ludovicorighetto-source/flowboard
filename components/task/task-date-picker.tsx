"use client";

import { Input } from "@/components/ui/input";

export function TaskDatePicker({
  label,
  value,
  onChange
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-ink">{label}</span>
      <Input
        type="date"
        value={value || ""}
        onChange={(event) => onChange(event.target.value || null)}
      />
    </label>
  );
}
