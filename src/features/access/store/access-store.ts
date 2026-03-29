"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const accessModes = ["guest", "member", "admin"] as const;

export type AccessMode = (typeof accessModes)[number];

export type AccessStore = {
  isAuthenticated: boolean;
  isAdminUnlocked: boolean;
  loginAsMember: () => void;
  logout: () => void;
  unlockAdmin: (password: string) => boolean;
  exitAdmin: () => void;
};

function getAdminAccessPassword() {
  return process.env.NEXT_PUBLIC_ADMIN_ACCESS_PASSWORD?.trim() ?? "";
}

export function getAccessMode(
  state: Pick<AccessStore, "isAuthenticated" | "isAdminUnlocked">
): AccessMode {
  if (!state.isAuthenticated) {
    return "guest";
  }

  if (state.isAdminUnlocked) {
    return "admin";
  }

  return "member";
}

export const useAccessStore = create<AccessStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isAdminUnlocked: false,
      loginAsMember: () => set({ isAuthenticated: true, isAdminUnlocked: false }),
      logout: () => set({ isAuthenticated: false, isAdminUnlocked: false }),
      unlockAdmin: (password) => {
        if (!get().isAuthenticated) {
          return false;
        }

        const adminAccessPassword = getAdminAccessPassword();

        if (!adminAccessPassword) {
          return false;
        }

        if (password.trim() !== adminAccessPassword) {
          return false;
        }

        set({ isAdminUnlocked: true });
        return true;
      },
      exitAdmin: () => {
        if (!get().isAdminUnlocked) {
          return;
        }

        set({ isAdminUnlocked: false });
      }
    }),
    {
      name: "heeby-access-store",
      version: 1,
      migrate: (persistedState) => {
        const legacyState = persistedState as
          | { accessMode?: AccessMode }
          | undefined;

        if (!legacyState?.accessMode) {
          return persistedState as AccessStore;
        }

        return {
          isAuthenticated: legacyState.accessMode !== "guest",
          isAdminUnlocked: legacyState.accessMode === "admin"
        } satisfies Pick<AccessStore, "isAuthenticated" | "isAdminUnlocked">;
      },
      storage: createJSONStorage(() => localStorage)
    }
  )
);
