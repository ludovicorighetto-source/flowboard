import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export async function getCurrentSession() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function getCurrentProfile() {
  noStore();
  const { supabase, user } = await getCurrentSession();

  if (!user) {
    return { supabase, user: null, profile: null as Profile | null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  return { supabase, user, profile };
}

export async function requireAuth() {
  const { user, profile } = await getCurrentProfile();

  if (!user) redirect("/login");
  if (profile && !profile.is_approved) redirect("/pending");
  if (!profile && user.email !== "ludovico.righetto@gmail.com") {
    redirect("/pending");
  }

  return {
    user,
    profile:
      profile ??
      ({
        id: user.id,
        email: user.email ?? "",
        full_name: (user.user_metadata?.full_name as string) ?? "Utente",
        is_approved: true,
        is_admin: user.email === "ludovico.righetto@gmail.com",
        created_at: new Date().toISOString()
      } as Profile)
  };
}

export async function requireAdmin() {
  const result = await requireAuth();

  if (
    !result.profile.is_admin &&
    result.user.email !== "ludovico.righetto@gmail.com"
  ) {
    redirect("/board");
  }

  return result;
}
