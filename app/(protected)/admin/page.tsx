import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminPage() {
  await requireAdmin();
  return <AdminUsersTable />;
}
