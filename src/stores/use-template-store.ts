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
  addTemplate: (values: TemplateFormValues) => Template;
  updateTemplate: (id: string, values: TemplateFormValues) => Template | undefined;
  getTemplateById: (id: string) => Template | undefined;
  removeTemplate: (id: string) => void;
};

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      templates: initialTemplates,
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
          templates: [nextTemplate, ...state.templates]
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
          )
        }));

        return nextTemplate;
      },
      getTemplateById: (id) => get().templates.find((template) => template.id === id),
      removeTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== id)
        }));
      }
    }),
    {
      name: "heeby-template-store",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
