"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const accessModes = ["guest", "member", "admin"] as const;

export type AccessMode = (typeof accessModes)[number];

function getAdminAccessPassword() {
  return process.env.NEXT_PUBLIC_ADMIN_ACCESS_PASSWORD?.trim() ?? "";
}

type AccessStore = {
  accessMode: AccessMode;
  loginAsMember: () => void;
  logout: () => void;
  unlockAdmin: (password: string) => boolean;
  exitAdmin: () => void;
};

export const useAccessStore = create<AccessStore>()(
  persist(
    (set, get) => ({
      accessMode: "guest",
      loginAsMember: () => set({ accessMode: "member" }),
      logout: () => set({ accessMode: "guest" }),
      unlockAdmin: (password) => {
        if (get().accessMode === "guest") {
          return false;
        }

        const adminAccessPassword = getAdminAccessPassword();

        if (!adminAccessPassword) {
          return false;
        }

        if (password.trim() !== adminAccessPassword) {
          return false;
        }

        set({ accessMode: "admin" });
        return true;
      },
      exitAdmin: () => {
        if (get().accessMode !== "admin") {
          return;
        }

        set({ accessMode: "member" });
      }
    }),
    {
      name: "heeby-access-store",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
