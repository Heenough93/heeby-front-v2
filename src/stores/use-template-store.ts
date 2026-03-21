"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { templates as initialTemplates } from "@/mocks/templates";
import type { Template } from "@/types/domain";
import type { TemplateFormValues } from "@/schemas/template-schema";

type TemplateStore = {
  templates: Template[];
  recentTemplateIds: string[];
  addTemplate: (values: TemplateFormValues) => Template;
  updateTemplate: (id: string, values: TemplateFormValues) => Template | undefined;
  getTemplateById: (id: string) => Template | undefined;
  markTemplateAsRecent: (id: string) => void;
  removeTemplate: (id: string) => void;
};

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      templates: initialTemplates,
      recentTemplateIds: initialTemplates.slice(0, 3).map((template) => template.id),
      addTemplate: (values) => {
        const now = dayjs().toISOString();
        const nextTemplate: Template = {
          id: nanoid(),
          name: values.name.trim(),
          theme: values.theme,
          questions: values.questions.map((question) => question.value.trim()),
          createdAt: now,
          updatedAt: now
        };

        set((state) => ({
          templates: [nextTemplate, ...state.templates],
          recentTemplateIds: [
            nextTemplate.id,
            ...state.recentTemplateIds.filter((id) => id !== nextTemplate.id)
          ].slice(0, 4)
        }));

        return nextTemplate;
      },
      updateTemplate: (id, values) => {
        const currentTemplate = get().templates.find((template) => template.id === id);

        if (!currentTemplate) {
          return undefined;
        }

        const nextTemplate: Template = {
          ...currentTemplate,
          name: values.name.trim(),
          theme: values.theme,
          questions: values.questions.map((question) => question.value.trim()),
          updatedAt: dayjs().toISOString()
        };

        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id ? nextTemplate : template
          ),
          recentTemplateIds: [
            nextTemplate.id,
            ...state.recentTemplateIds.filter((templateId) => templateId !== nextTemplate.id)
          ].slice(0, 4)
        }));

        return nextTemplate;
      },
      getTemplateById: (id) => get().templates.find((template) => template.id === id),
      markTemplateAsRecent: (id) => {
        if (!get().templates.some((template) => template.id === id)) {
          return;
        }

        set((state) => ({
          recentTemplateIds: [
            id,
            ...state.recentTemplateIds.filter((templateId) => templateId !== id)
          ].slice(0, 4)
        }));
      },
      removeTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== id),
          recentTemplateIds: state.recentTemplateIds.filter(
            (templateId) => templateId !== id
          )
        }));
      }
    }),
    {
      name: "heeby-template-store",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
