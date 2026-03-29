"use client";

import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { travelVisits as initialTravelVisits } from "@/mocks/travel-visits";
import type { TravelVisitFormValues } from "@/features/travel/lib/travel-visit-schema";
import type { TravelVisit } from "@/features/travel/lib/travel-types";

type TravelStore = {
  visits: TravelVisit[];
  addVisit: (values: TravelVisitFormValues) => TravelVisit;
  removeVisit: (id: string) => void;
  resetVisits: () => void;
};

export const useTravelStore = create<TravelStore>()(
  persist(
    (set) => ({
      visits: initialTravelVisits,
      addVisit: (values) => {
        const now = dayjs().toISOString();
        const nextVisit: TravelVisit = {
          id: nanoid(),
          city: values.city.trim(),
          country: values.country.trim(),
          latitude: values.latitude,
          longitude: values.longitude,
          startedAt: values.startedAt,
          endedAt: values.endedAt?.trim() || undefined,
          note: values.note?.trim() || undefined,
          createdAt: now,
          updatedAt: now
        };

        set((state) => ({
          visits: [...state.visits, nextVisit]
        }));

        return nextVisit;
      },
      removeVisit: (id) =>
        set((state) => ({
          visits: state.visits.filter((visit) => visit.id !== id)
        })),
      resetVisits: () => set({ visits: initialTravelVisits })
    }),
    {
      name: "heeby-travel-store",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
