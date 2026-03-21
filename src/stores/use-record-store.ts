"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { records as initialRecords } from "@/mocks/records";
import type { JournalRecord } from "@/types/domain";
import type { RecordFormValues } from "@/schemas/record-schema";

type RecordStore = {
  records: JournalRecord[];
  addRecord: (values: RecordFormValues) => JournalRecord;
  updateRecord: (id: string, values: RecordFormValues) => JournalRecord | undefined;
  getRecordById: (id: string) => JournalRecord | undefined;
  removeRecord: (id: string) => void;
};

export const useRecordStore = create<RecordStore>()(
  persist(
    (set, get) => ({
      records: initialRecords,
      addRecord: (values) => {
        const now = dayjs().toISOString();
        const nextRecord: JournalRecord = {
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
          records: [nextRecord, ...state.records]
        }));

        return nextRecord;
      },
      updateRecord: (id, values) => {
        const currentRecord = get().records.find((record) => record.id === id);

        if (!currentRecord) {
          return undefined;
        }

        const nextRecord: JournalRecord = {
          ...currentRecord,
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
          records: state.records.map((record) =>
            record.id === id ? nextRecord : record
          )
        }));

        return nextRecord;
      },
      getRecordById: (id) => get().records.find((record) => record.id === id),
      removeRecord: (id) => {
        set((state) => ({
          records: state.records.filter((record) => record.id !== id)
        }));
      }
    }),
    {
      name: "heeby-record-store",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
