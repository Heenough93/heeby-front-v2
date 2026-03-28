export const themeValues = ["업무", "여행", "개발", "주식", "운동"] as const;
export const contentVisibilityValues = ["public", "private"] as const;

export type Theme = (typeof themeValues)[number];
export type ContentVisibility = (typeof contentVisibilityValues)[number];

export type JournalTemplate = {
  id: string;
  name: string;
  theme: Theme;
  questions: string[];
  visibility: ContentVisibility;
  createdAt: string;
  updatedAt: string;
};

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
