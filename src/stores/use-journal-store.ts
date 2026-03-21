"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { journals as initialJournals } from "@/mocks/journals";
import type { Journal } from "@/types/domain";
import type { JournalFormValues } from "@/schemas/journal-schema";

type JournalStore = {
  journals: Journal[];
  addJournal: (values: JournalFormValues) => Journal;
  updateJournal: (id: string, values: JournalFormValues) => Journal | undefined;
  getJournalById: (id: string) => Journal | undefined;
  removeJournal: (id: string) => void;
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
          templateId: values.templateId,
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
          templateId: values.templateId,
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
      removeJournal: (id) => {
        set((state) => ({
          journals: state.journals.filter((journal) => journal.id !== id)
        }));
      }
    }),
    {
      name: "heeby-journal-store",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
