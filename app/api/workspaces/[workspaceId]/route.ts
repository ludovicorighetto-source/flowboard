import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/types";

export async function DELETE(
  _request: NextRequest,
  context: { params: { workspaceId: string } }
) {
  const workspaceId = context.params.workspaceId;

  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Utente non autenticato." }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle<Profile>();

    const isAdmin =
      profile?.is_admin || profile?.email === "ludovico.righetto@gmail.com";
    if (!isAdmin) {
      return NextResponse.json({ error: "Permessi insufficienti." }, { status: 403 });
    }

    const adminClient = createSupabaseAdminClient();

    const { count: workspaceCount, error: countError } = await adminClient
      .from("workspaces")
      .select("*", { count: "exact", head: true });

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    if ((workspaceCount || 0) <= 1) {
      return NextResponse.json(
        { error: "Devi mantenere almeno un workspace." },
        { status: 400 }
      );
    }

    const { data: target } = await adminClient
      .from("workspaces")
      .select("id")
      .eq("id", workspaceId)
      .maybeSingle<{ id: string }>();

    if (!target) {
      return NextResponse.json({ error: "Workspace non trovato." }, { status: 404 });
    }

    const { error: deleteError } = await adminClient
      .from("workspaces")
      .delete()
      .eq("id", workspaceId);

    if (deleteError) {
      const details = [deleteError.message, deleteError.details, deleteError.hint]
        .filter(Boolean)
        .join(" | ");
      return NextResponse.json(
        { error: details || "Errore eliminazione workspace." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore interno.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
