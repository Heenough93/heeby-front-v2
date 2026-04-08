import type { OwnerScope } from "@/types/domain";

export const assetSnapshotCategoryValues = ["cash", "invest", "retirement"] as const;
export const assetSnapshotMajorTypeValues = [
  "deposit",
  "securities",
  "insurance",
  "other",
  "cash"
] as const;

export type AssetSnapshotCategory = (typeof assetSnapshotCategoryValues)[number];
export type AssetSnapshotMajorType = (typeof assetSnapshotMajorTypeValues)[number];

export type AssetSnapshot = {
  id: string;
  title: string;
  monthKey: string;
  memo?: string;
  sourceSnapshotId?: string;
  createdAt: string;
  updatedAt: string;
};

export type AssetSnapshotItem = {
  id: string;
  snapshotId: string;
  ownerScope: OwnerScope;
  majorType: AssetSnapshotMajorType;
  institution: string;
  label: string;
  category: AssetSnapshotCategory;
  amount: number;
  createdAt: string;
  updatedAt: string;
};

export type AssetSnapshotDraftItem = {
  id: string;
  ownerScope: OwnerScope;
  majorType: AssetSnapshotMajorType;
  institution: string;
  label: string;
  category: AssetSnapshotCategory;
  amount: string;
};

export type AssetSnapshotEditorValues = {
  title: string;
  monthKey: string;
  memo?: string;
  sourceSnapshotId?: string;
  items: AssetSnapshotDraftItem[];
};
