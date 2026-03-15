import type { Profile } from "@/types";

export function AvatarGroup({ users }: { users: Profile[] }) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center">
      {users.slice(0, 4).map((user, index) => (
        <div
          key={user.id}
          className="-ml-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#eef4ff] text-xs font-semibold text-action first:ml-0"
          style={{ zIndex: users.length - index }}
          title={user.full_name || user.email}
        >
          {(user.full_name || user.email).slice(0, 2).toUpperCase()}
        </div>
      ))}
      {users.length > 4 ? (
        <div className="-ml-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-black/[0.04] text-xs font-semibold text-muted">
          +{users.length - 4}
        </div>
      ) : null}
    </div>
  );
}
