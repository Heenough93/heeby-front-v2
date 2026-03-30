import type { ContentVisibility, Theme } from "@/types/domain";

export type JournalTemplate = {
  id: string;
  name: string;
  theme: Theme;
  questions: string[];
  visibility: ContentVisibility;
  createdAt: string;
  updatedAt: string;
};
