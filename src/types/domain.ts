export const themeValues = ["업무", "여행", "개발", "주식", "운동"] as const;
export const contentVisibilityValues = ["public", "private"] as const;
export const ownerScopeValues = ["yumja", "heeby"] as const;

export type Theme = (typeof themeValues)[number];
export type ContentVisibility = (typeof contentVisibilityValues)[number];
export type OwnerScope = (typeof ownerScopeValues)[number];

export function getOwnerScopeLabel(scope: OwnerScope) {
  return scope === "yumja" ? "윰자" : "희비";
}
