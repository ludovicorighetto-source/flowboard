import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/session";

export default async function HomePage() {
  const { user, profile } = await getCurrentProfile();

  if (!user) redirect("/login");
  if (!profile?.is_approved) redirect("/pending");
  redirect("/board");
}
