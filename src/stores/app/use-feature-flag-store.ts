"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type FeatureFlagKey = "showTravelWidget" | "showStockWidget";

type FeatureFlags = Record<FeatureFlagKey, boolean>;

type FeatureFlagStore = {
  flags: FeatureFlags;
  toggleFlag: (key: FeatureFlagKey) => void;
  setFlag: (key: FeatureFlagKey, value: boolean) => void;
  resetFlags: () => void;
};

const defaultFlags: FeatureFlags = {
  showTravelWidget: true,
  showStockWidget: true
};

export const useFeatureFlagStore = create<FeatureFlagStore>()(
  persist(
    (set) => ({
      flags: defaultFlags,
      toggleFlag: (key) =>
        set((state) => ({
          flags: {
            ...state.flags,
            [key]: !state.flags[key]
          }
        })),
      setFlag: (key, value) =>
        set((state) => ({
          flags: {
            ...state.flags,
            [key]: value
          }
        })),
      resetFlags: () => set({ flags: defaultFlags })
    }),
    {
      name: "heeby-feature-flag-store",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
