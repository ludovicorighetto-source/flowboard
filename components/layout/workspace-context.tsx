"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Profile, Workspace, WorkspaceMember } from "@/types";

type WorkspaceContextValue = {
  currentProfile: Profile;
  loading: boolean;
  error: string | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  allApprovedUsers: Profile[];
  membersByWorkspace: Record<string, WorkspaceMember[]>;
  createWorkspace: (name: string, description?: string) => Promise<Workspace | null>;
  renameWorkspace: (workspaceId: string, name: string) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  setActiveWorkspace: (workspaceId: string) => void;
  addMember: (workspaceId: string, userId: string) => Promise<void>;
  removeMember: (workspaceId: string, userId: string) => Promise<void>;
  setUserWorkspaceAccess: (userId: string, workspaceIds: string[]) => Promise<void>;
  getUserWorkspaceIds: (userId: string) => string[];
  refresh: () => Promise<void>;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function getStorageKey(userId: string, key: string) {
  return `flowboard.${key}.${userId}`;
}

export function WorkspaceProvider({
  profile,
  children
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [allApprovedUsers, setAllApprovedUsers] = useState<Profile[]>([]);
  const [membersByWorkspace, setMembersByWorkspace] = useState<Record<string, WorkspaceMember[]>>({});

  const loadData = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    setLoading(true);
    setError(null);
    const isAdmin =
      profile.is_admin || profile.email === "ludovico.righetto@gmail.com";

    const [{ data: workspaceRows, error: workspaceError }, { data: memberRows, error: memberError }, { data: approvedUsers, error: usersError }] = await Promise.all([
      supabase.from("workspaces").select("*").order("created_at", { ascending: true }),
      supabase
        .from("workspace_members")
        .select("workspace_id, user_id, created_at, user:profiles(*)"),
      supabase
        .from("profiles")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: true })
    ]);

    if (workspaceError || memberError || usersError) {
      setError(
        workspaceError?.message ||
          memberError?.message ||
          usersError?.message ||
          "Errore caricamento workspace"
      );
      setLoading(false);
      return;
    }

    let workspaceList = (workspaceRows || []) as Workspace[];
    const memberships = (memberRows || []) as WorkspaceMember[];
    const byWorkspace = memberships.reduce<Record<string, WorkspaceMember[]>>((acc, member) => {
      acc[member.workspace_id] = [...(acc[member.workspace_id] || []), member];
      return acc;
    }, {});

    if (workspaceList.length === 0 && isAdmin) {
      const { data: created, error: createDefaultError } = await supabase
        .from("workspaces")
        .insert({
          name: "Workspace principale",
          description: "Workspace iniziale",
          created_by: profile.id
        })
        .select("*")
        .single<Workspace>();

      if (createDefaultError) {
        setError(createDefaultError.message);
        setLoading(false);
        return;
      }

      if (created) {
        await supabase
          .from("workspace_members")
          .upsert(
            { workspace_id: created.id, user_id: profile.id },
            { onConflict: "workspace_id,user_id" }
          );
        workspaceList = [created];
      }
    }

    const activeKey = getStorageKey(profile.id, "activeWorkspace");
    const storedActive = window.localStorage.getItem(activeKey);
    const nextActive =
      storedActive && workspaceList.some((workspace) => workspace.id === storedActive)
        ? storedActive
        : workspaceList[0]?.id || null;

    if (nextActive) {
      window.localStorage.setItem(activeKey, nextActive);
    } else {
      window.localStorage.removeItem(activeKey);
    }

    setWorkspaces(workspaceList);
    setMembersByWorkspace(byWorkspace);
    setAllApprovedUsers((approvedUsers || []) as Profile[]);
    setActiveWorkspaceId(nextActive);
    setLoading(false);
  }, [profile.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function createWorkspace(name: string, description = "") {
    const supabase = createSupabaseBrowserClient();
    const nextName = name.trim();
    if (!nextName) return null;

    const isAdmin =
      profile.is_admin || profile.email === "ludovico.righetto@gmail.com";
    if (!isAdmin) return null;
    setError(null);

    const { data: created, error: createError } = await supabase
      .from("workspaces")
      .insert({
        name: nextName,
        description: description.trim() || null,
        created_by: profile.id
      })
      .select("*")
      .single<Workspace>();

    if (createError || !created) {
      setError(createError?.message || "Impossibile creare workspace");
      return null;
    }

    if (created) {
      await supabase
        .from("workspace_members")
        .upsert(
          { workspace_id: created.id, user_id: profile.id },
          { onConflict: "workspace_id,user_id" }
        );
      const activeKey = getStorageKey(profile.id, "activeWorkspace");
      window.localStorage.setItem(activeKey, created.id);
      setActiveWorkspaceId(created.id);
    }

    await loadData();
    return created || null;
  }

  async function renameWorkspace(workspaceId: string, name: string) {
    const supabase = createSupabaseBrowserClient();
    const nextName = name.trim();
    if (!nextName) return;
    const { error: renameError } = await supabase
      .from("workspaces")
      .update({ name: nextName })
      .eq("id", workspaceId);
    if (renameError) {
      setError(renameError.message);
      return;
    }
    await loadData();
  }

  async function deleteWorkspace(workspaceId: string) {
    const supabase = createSupabaseBrowserClient();
    const isAdmin =
      profile.is_admin || profile.email === "ludovico.righetto@gmail.com";
    if (!isAdmin) return;
    if (workspaces.length <= 1) {
      setError("Devi mantenere almeno un workspace.");
      return;
    }

    setError(null);
    const { data: targetWorkspace } = await supabase
      .from("workspaces")
      .select("id")
      .eq("id", workspaceId)
      .maybeSingle<{ id: string }>();

    if (!targetWorkspace) {
      setError("Workspace non trovato o non accessibile.");
      return;
    }

    const { data: deletedRows, error: deleteError } = await supabase
      .from("workspaces")
      .delete()
      .eq("id", workspaceId)
      .select("id");

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    if (!deletedRows || deletedRows.length === 0) {
      setError("Eliminazione non riuscita: permessi insufficienti o workspace non trovato.");
      return;
    }

    await loadData();
  }

  function setActiveWorkspace(workspaceId: string) {
    if (!workspaces.some((workspace) => workspace.id === workspaceId)) return;
    const activeKey = getStorageKey(profile.id, "activeWorkspace");
    window.localStorage.setItem(activeKey, workspaceId);
    setActiveWorkspaceId(workspaceId);
  }

  async function addMember(workspaceId: string, userId: string) {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("workspace_members").insert({ workspace_id: workspaceId, user_id: userId });
    await loadData();
  }

  async function removeMember(workspaceId: string, userId: string) {
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("workspace_members")
      .delete()
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId);
    await loadData();
  }

  function getUserWorkspaceIds(userId: string) {
    return Object.entries(membersByWorkspace)
      .filter(([, members]) => members.some((member) => member.user_id === userId))
      .map(([workspaceId]) => workspaceId);
  }

  async function setUserWorkspaceAccess(userId: string, workspaceIds: string[]) {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("workspace_members").delete().eq("user_id", userId);

    const rows = workspaceIds.map((workspaceId) => ({
      workspace_id: workspaceId,
      user_id: userId
    }));
    if (rows.length > 0) {
      await supabase.from("workspace_members").insert(rows);
    }

    await loadData();
  }

  const value = useMemo<WorkspaceContextValue>(() => {
    const activeWorkspace =
      workspaces.find((workspace) => workspace.id === activeWorkspaceId) || null;

    return {
      currentProfile: profile,
      loading,
      error,
      workspaces,
      activeWorkspace,
      allApprovedUsers,
      membersByWorkspace,
      createWorkspace,
      renameWorkspace,
      deleteWorkspace,
      setActiveWorkspace,
      addMember,
      removeMember,
      setUserWorkspaceAccess,
      getUserWorkspaceIds,
      refresh: loadData
    };
  }, [activeWorkspaceId, allApprovedUsers, error, loadData, loading, membersByWorkspace, profile, workspaces]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    return {
      currentProfile: {
        id: "",
        email: "",
        full_name: null,
        is_approved: false,
        is_admin: false,
        created_at: ""
      },
      loading: false,
      error: null,
      workspaces: [],
      activeWorkspace: null,
      allApprovedUsers: [],
      membersByWorkspace: {},
      createWorkspace: async () => null,
      renameWorkspace: async () => {},
      deleteWorkspace: async () => {},
      setActiveWorkspace: () => {},
      addMember: async () => {},
      removeMember: async () => {},
      setUserWorkspaceAccess: async () => {},
      getUserWorkspaceIds: () => [],
      refresh: async () => {}
    };
  }
  return context;
}
