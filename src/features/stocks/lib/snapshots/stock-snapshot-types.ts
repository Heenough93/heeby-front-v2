import type { StockMarket } from "@/features/stocks/lib/shared/stock-core-types";

export const stockSnapshotScopeValues = ["KR", "US"] as const;

export type StockSnapshotScope = (typeof stockSnapshotScopeValues)[number];

export type StockSnapshot = {
  id: string;
  title: string;
  weekKey: string;
  marketScope: StockSnapshotScope;
  comment?: string;
  sourceSnapshotId?: string;
  createdAt: string;
  updatedAt: string;
};

export type StockSnapshotItem = {
  id: string;
  snapshotId: string;
  stockId: string;
  rank: number;
  marketCap?: string;
  price?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type StockSnapshotDraftItem = {
  id: string;
  stockId?: string;
  name: string;
  ticker: string;
  market: StockMarket;
  sector?: string;
  marketCap?: string;
  price?: string;
  note?: string;
};

export type StockSnapshotEditorValues = {
  title: string;
  weekKey: string;
  marketScope: StockSnapshotScope;
  comment?: string;
  sourceSnapshotId?: string;
  items: StockSnapshotDraftItem[];
};
