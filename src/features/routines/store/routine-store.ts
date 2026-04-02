"use client";

import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { routines as initialRoutines } from "@/mocks/routines";
import type { RoutineFormValues } from "@/features/routines/lib/routine-schema";
import type { Routine } from "@/features/routines/lib/routine-types";

function toRoutine(values: RoutineFormValues, current?: Routine): Routine {
  const now = dayjs().toISOString();
  const base = {
    id: current?.id ?? nanoid(),
    title: values.title.trim(),
    message: values.message.trim(),
    time: values.time,
    isActive: values.isActive,
    channel: values.channel,
    createdAt: current?.createdAt ?? now,
    updatedAt: now
  };

  switch (values.repeatType) {
    case "daily":
      return {
        ...base,
        repeatType: "daily"
      };
    case "weekly":
      return {
        ...base,
        repeatType: "weekly",
        dayOfWeek: values.dayOfWeek ?? 0
      };
    case "monthly":
      return {
        ...base,
        repeatType: "monthly",
        dayOfMonth: values.dayOfMonth ?? 1
      };
    case "yearly":
      return {
        ...base,
        repeatType: "yearly",
        month: values.month ?? 1,
        dayOfMonth: values.dayOfMonth ?? 1
      };
    case "once":
      return {
        ...base,
        repeatType: "once",
        scheduledDate: values.scheduledDate ?? dayjs().format("YYYY-MM-DD")
      };
  }
}

type RoutineStore = {
  routines: Routine[];
  addRoutine: (values: RoutineFormValues) => Routine;
  updateRoutine: (id: string, values: RoutineFormValues) => Routine | undefined;
  getRoutineById: (id: string) => Routine | undefined;
  removeRoutine: (id: string) => void;
  resetRoutines: () => void;
};

export const useRoutineStore = create<RoutineStore>()(
  persist(
    (set, get) => ({
      routines: initialRoutines,
      addRoutine: (values) => {
        const nextRoutine = toRoutine(values);

        set((state) => ({
          routines: [nextRoutine, ...state.routines]
        }));

        return nextRoutine;
      },
      updateRoutine: (id, values) => {
        const currentRoutine = get().routines.find((routine) => routine.id === id);

        if (!currentRoutine) {
          return undefined;
        }

        const nextRoutine = toRoutine(values, currentRoutine);

        set((state) => ({
          routines: state.routines.map((routine) => (routine.id === id ? nextRoutine : routine))
        }));

        return nextRoutine;
      },
      getRoutineById: (id) => get().routines.find((routine) => routine.id === id),
      removeRoutine: (id) =>
        set((state) => ({
          routines: state.routines.filter((routine) => routine.id !== id)
        })),
      resetRoutines: () => set({ routines: initialRoutines })
    }),
    {
      name: "heeby-routine-store",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
