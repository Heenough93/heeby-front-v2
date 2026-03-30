"use client";

import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { canReadContent } from "@/features/access/lib/access-policy";
import type { AccessMode } from "@/features/access/store/access-store";
import type { Journal } from "@/features/journals/lib/journal-types";
import { journals as initialJournals } from "@/mocks/journals";
import type { JournalFormValues } from "@/schemas/journal-schema";

export type JournalStore = {
  journals: Journal[];
  addJournal: (values: JournalFormValues) => Journal;
  updateJournal: (id: string, values: JournalFormValues) => Journal | undefined;
  getJournalById: (id: string) => Journal | undefined;
  getReadableJournals: (accessMode: AccessMode) => Journal[];
  getReadableJournalById: (
    id: string,
    accessMode: AccessMode
  ) => Journal | undefined;
  removeJournal: (id: string) => void;
  resetJournals: () => void;
};

export const useJournalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      journals: initialJournals,
      addJournal: (values) => {
        const now = dayjs().toISOString();
        const nextJournal: Journal = {
          id: nanoid(),
          title: values.title.trim(),
          theme: values.theme,
          journalTemplateId: values.journalTemplateId,
          visibility: values.visibility,
          answers: values.answers.map((item) => ({
            question: item.question.trim(),
            answer: item.answer.trim()
          })),
          createdAt: now,
          updatedAt: now
        };

        set((state) => ({
          journals: [nextJournal, ...state.journals]
        }));

        return nextJournal;
      },
      updateJournal: (id, values) => {
        const currentJournal = get().journals.find((journal) => journal.id === id);

        if (!currentJournal) {
          return undefined;
        }

        const nextJournal: Journal = {
          ...currentJournal,
          title: values.title.trim(),
          theme: values.theme,
          journalTemplateId: values.journalTemplateId,
          visibility: values.visibility,
          answers: values.answers.map((item) => ({
            question: item.question.trim(),
            answer: item.answer.trim()
          })),
          updatedAt: dayjs().toISOString()
        };

        set((state) => ({
          journals: state.journals.map((journal) =>
            journal.id === id ? nextJournal : journal
          )
        }));

        return nextJournal;
      },
      getJournalById: (id) => get().journals.find((journal) => journal.id === id),
      getReadableJournals: (accessMode) =>
        get().journals.filter((journal) =>
          canReadContent(accessMode, journal.visibility)
        ),
      getReadableJournalById: (id, accessMode) => {
        const journal = get().journals.find((item) => item.id === id);

        if (!journal || !canReadContent(accessMode, journal.visibility)) {
          return undefined;
        }

        return journal;
      },
      removeJournal: (id) => {
        set((state) => ({
          journals: state.journals.filter((journal) => journal.id !== id)
        }));
      },
      resetJournals: () => {
        set({
          journals: initialJournals
        });
      }
    }),
    {
      name: "heeby-journal-store",
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<JournalStore> | undefined;

        if (!state?.journals) {
          return persistedState as JournalStore;
        }

        return {
          ...state,
          journals: state.journals.map((journal) => ({
            ...journal,
            visibility: journal.visibility ?? "private"
          }))
        } satisfies Partial<JournalStore>;
      },
      storage: createJSONStorage(() => localStorage)
    }
  )
);
