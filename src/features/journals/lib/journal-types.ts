import type { ContentVisibility, Theme } from "@/types/domain";

export type JournalAnswer = {
  question: string;
  answer: string;
};

export type Journal = {
  id: string;
  title: string;
  theme: Theme;
  journalTemplateId: string;
  answers: JournalAnswer[];
  visibility: ContentVisibility;
  createdAt: string;
  updatedAt: string;
};
