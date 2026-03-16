"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { Profile } from "@/types";

export type WorkspaceItem = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
};

type WorkspaceContextValue = {
  workspaces: WorkspaceItem[];
  activeWorkspace: WorkspaceItem | null;
  createWorkspace: (name: string, description?: string) => WorkspaceItem;
  renameWorkspace: (workspaceId: string, name: string) => void;
  setActiveWorkspace: (workspaceId: string) => void;
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
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const workspacesKey = getStorageKey(profile.id, "workspaces");
    const activeKey = getStorageKey(profile.id, "activeWorkspace");

    const stored = window.localStorage.getItem(workspacesKey);
    const parsed = stored ? (JSON.parse(stored) as WorkspaceItem[]) : [];

    const initialWorkspaces =
      parsed.length > 0
        ? parsed
        : [
            {
              id: crypto.randomUUID(),
              name: "Workspace principale",
              description: "Workspace iniziale",
              createdAt: new Date().toISOString()
            }
          ];

    const storedActive = window.localStorage.getItem(activeKey);
    const initialActiveId =
      storedActive && initialWorkspaces.some((workspace) => workspace.id === storedActive)
        ? storedActive
        : initialWorkspaces[0].id;

    setWorkspaces(initialWorkspaces);
    setActiveWorkspaceId(initialActiveId);
    setReady(true);

    window.localStorage.setItem(workspacesKey, JSON.stringify(initialWorkspaces));
    window.localStorage.setItem(activeKey, initialActiveId);
  }, [profile.id]);

  function persist(nextWorkspaces: WorkspaceItem[], nextActiveId: string) {
    const workspacesKey = getStorageKey(profile.id, "workspaces");
    const activeKey = getStorageKey(profile.id, "activeWorkspace");
    window.localStorage.setItem(workspacesKey, JSON.stringify(nextWorkspaces));
    window.localStorage.setItem(activeKey, nextActiveId);
  }

  useEffect(() => {
    if (!ready) return;
    if (!activeWorkspaceId) return;
    persist(workspaces, activeWorkspaceId);
  }, [ready, workspaces, activeWorkspaceId]);

  function createWorkspace(name: string, description = "") {
    const created: WorkspaceItem = {
      id: crypto.randomUUID(),
      name,
      description,
      createdAt: new Date().toISOString()
    };
    setWorkspaces((current) => [...current, created]);
    setActiveWorkspaceId(created.id);
    return created;
  }

  function setActiveWorkspace(workspaceId: string) {
    if (!workspaces.some((workspace) => workspace.id === workspaceId)) {
      return;
    }
    setActiveWorkspaceId(workspaceId);
  }

  function renameWorkspace(workspaceId: string, name: string) {
    const nextName = name.trim();
    if (!nextName) return;

    setWorkspaces((current) =>
      current.map((workspace) =>
        workspace.id === workspaceId ? { ...workspace, name: nextName } : workspace
      )
    );
  }

  const value = useMemo<WorkspaceContextValue>(() => {
    const activeWorkspace =
      workspaces.find((workspace) => workspace.id === activeWorkspaceId) || null;

    return {
      workspaces,
      activeWorkspace,
      createWorkspace,
      renameWorkspace,
      setActiveWorkspace
    };
  }, [activeWorkspaceId, workspaces]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    return {
      workspaces: [],
      activeWorkspace: null,
      createWorkspace: () => ({
        id: "",
        name: "",
        description: "",
        createdAt: ""
      }),
      renameWorkspace: () => {},
      setActiveWorkspace: () => {}
    };
  }
  return context;
}
