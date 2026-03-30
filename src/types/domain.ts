export const themeValues = ["업무", "여행", "개발", "주식", "운동"] as const;
export const contentVisibilityValues = ["public", "private"] as const;

export type Theme = (typeof themeValues)[number];
export type ContentVisibility = (typeof contentVisibilityValues)[number];
