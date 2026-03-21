export const themeValues = ["업무", "여행", "개발", "주식", "운동"] as const;

export type Theme = (typeof themeValues)[number];

export type Template = {
  id: string;
  name: string;
  theme: Theme;
  questions: string[];
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
  templateId: string;
  answers: JournalAnswer[];
  createdAt: string;
  updatedAt: string;
};
