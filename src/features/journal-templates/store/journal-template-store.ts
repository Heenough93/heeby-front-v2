"use client";

import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { JournalTemplate } from "@/features/journal-templates/lib/journal-template-types";
import { journalTemplates as initialJournalTemplates } from "@/mocks/journal-templates";
import type { JournalTemplateFormValues } from "@/schemas/journal-template-schema";
import type { Theme } from "@/types/domain";

export type JournalTemplateStore = {
  journalTemplates: JournalTemplate[];
  recentJournalTemplateIds: string[];
  addJournalTemplate: (values: JournalTemplateFormValues) => JournalTemplate;
  updateJournalTemplate: (
    id: string,
    values: JournalTemplateFormValues
  ) => JournalTemplate | undefined;
  getJournalTemplateById: (id: string) => JournalTemplate | undefined;
  getJournalTemplatesByTheme: (theme: Theme) => JournalTemplate[];
  getRecentJournalTemplates: () => JournalTemplate[];
  markJournalTemplateAsRecent: (id: string) => void;
  removeJournalTemplate: (id: string) => void;
  resetJournalTemplates: () => void;
};

export const useJournalTemplateStore = create<JournalTemplateStore>()(
  persist(
    (set, get) => ({
      journalTemplates: initialJournalTemplates,
      recentJournalTemplateIds: initialJournalTemplates
        .slice(0, 3)
        .map((journalTemplate) => journalTemplate.id),
      addJournalTemplate: (values) => {
        const now = dayjs().toISOString();
        const nextJournalTemplate: JournalTemplate = {
          id: nanoid(),
          name: values.name.trim(),
          theme: values.theme,
          visibility: values.visibility,
          questions: values.questions.map((question) => question.value.trim()),
          createdAt: now,
          updatedAt: now
        };

        set((state) => ({
          journalTemplates: [nextJournalTemplate, ...state.journalTemplates],
          recentJournalTemplateIds: [
            nextJournalTemplate.id,
            ...state.recentJournalTemplateIds.filter(
              (id) => id !== nextJournalTemplate.id
            )
          ].slice(0, 4)
        }));

        return nextJournalTemplate;
      },
      updateJournalTemplate: (id, values) => {
        const currentJournalTemplate = get().journalTemplates.find(
          (journalTemplate) => journalTemplate.id === id
        );

        if (!currentJournalTemplate) {
          return undefined;
        }

        const nextJournalTemplate: JournalTemplate = {
          ...currentJournalTemplate,
          name: values.name.trim(),
          theme: values.theme,
          visibility: values.visibility,
          questions: values.questions.map((question) => question.value.trim()),
          updatedAt: dayjs().toISOString()
        };

        set((state) => ({
          journalTemplates: state.journalTemplates.map((journalTemplate) =>
            journalTemplate.id === id ? nextJournalTemplate : journalTemplate
          ),
          recentJournalTemplateIds: [
            nextJournalTemplate.id,
            ...state.recentJournalTemplateIds.filter(
              (journalTemplateId) => journalTemplateId !== nextJournalTemplate.id
            )
          ].slice(0, 4)
        }));

        return nextJournalTemplate;
      },
      getJournalTemplateById: (id) =>
        get().journalTemplates.find((journalTemplate) => journalTemplate.id === id),
      getJournalTemplatesByTheme: (theme) =>
        get().journalTemplates.filter((journalTemplate) => journalTemplate.theme === theme),
      getRecentJournalTemplates: () =>
        get()
          .recentJournalTemplateIds.map((id) =>
            get().journalTemplates.find((journalTemplate) => journalTemplate.id === id)
          )
          .filter(
            (journalTemplate): journalTemplate is JournalTemplate =>
              Boolean(journalTemplate)
          ),
      markJournalTemplateAsRecent: (id) => {
        if (!get().journalTemplates.some((journalTemplate) => journalTemplate.id === id)) {
          return;
        }

        set((state) => ({
          recentJournalTemplateIds: [
            id,
            ...state.recentJournalTemplateIds.filter(
              (journalTemplateId) => journalTemplateId !== id
            )
          ].slice(0, 4)
        }));
      },
      removeJournalTemplate: (id) => {
        set((state) => ({
          journalTemplates: state.journalTemplates.filter(
            (journalTemplate) => journalTemplate.id !== id
          ),
          recentJournalTemplateIds: state.recentJournalTemplateIds.filter(
            (journalTemplateId) => journalTemplateId !== id
          )
        }));
      },
      resetJournalTemplates: () => {
        set({
          journalTemplates: initialJournalTemplates,
          recentJournalTemplateIds: initialJournalTemplates
            .slice(0, 3)
            .map((journalTemplate) => journalTemplate.id)
        });
      }
    }),
    {
      name: "heeby-journal-template-store",
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as Partial<JournalTemplateStore> | undefined;

        if (!state?.journalTemplates) {
          return persistedState as JournalTemplateStore;
        }

        return {
          ...state,
          journalTemplates: state.journalTemplates.map((journalTemplate) => ({
            ...journalTemplate,
            visibility: journalTemplate.visibility ?? "private"
          }))
        } satisfies Partial<JournalTemplateStore>;
      },
      storage: createJSONStorage(() => localStorage)
    }
  )
);
