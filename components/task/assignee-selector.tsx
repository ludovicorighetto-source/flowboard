"use client";

import type { Profile } from "@/types";

export function AssigneeSelector({
  users,
  selectedIds,
  onChange
}: {
  users: Profile[];
  selectedIds: string[];
  onChange: (ids: string[]) => Promise<void>;
}) {
  return (
    <div className="space-y-2">
      {users.map((user) => {
        const checked = selectedIds.includes(user.id);
        return (
          <label
            key={user.id}
            className="flex cursor-pointer items-center justify-between rounded-control border border-black/[0.06] bg-white px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium text-ink">{user.full_name || "Utente"}</p>
              <p className="text-xs text-muted">{user.email}</p>
            </div>
            <input
              type="checkbox"
              checked={checked}
              onChange={(event) => {
                const next = event.target.checked
                  ? [...selectedIds, user.id]
                  : selectedIds.filter((id) => id !== user.id);
                void onChange(next);
              }}
            />
          </label>
        );
      })}
    </div>
  );
}
