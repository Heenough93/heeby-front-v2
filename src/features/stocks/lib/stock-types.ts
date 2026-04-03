export const stockMarketValues = ["KR", "US", "ETF", "OTHER"] as const;

export type StockMarket = (typeof stockMarketValues)[number];

export type Stock = {
  id: string;
  name: string;
  ticker: string;
  market: StockMarket;
  sector?: string;
  createdAt: string;
  updatedAt: string;
};

export type StockSnapshot = {
  id: string;
  title: string;
  weekKey: string;
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
  comment?: string;
  sourceSnapshotId?: string;
  items: StockSnapshotDraftItem[];
};

export const stockTradeAccountTypeValues = [
  "general",
  "isa",
  "pension",
  "overseas",
  "ipo"
] as const;

export type StockTradeAccountType = (typeof stockTradeAccountTypeValues)[number];

export const stockTradeSideValues = ["buy", "sell"] as const;

export type StockTradeSide = (typeof stockTradeSideValues)[number];

export type StockTradeEntry = {
  id: string;
  tradedAt: string;
  accountName: string;
  accountType: StockTradeAccountType;
  stockName: string;
  ticker: string;
  market: StockMarket;
  side: StockTradeSide;
  quantity: number;
  price: number;
  exchangeRate?: number;
  fee?: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type StockTradeDraftRow = {
  id: string;
  tradedAt: string;
  accountName: string;
  accountType: StockTradeAccountType;
  stockName: string;
  ticker: string;
  market: StockMarket;
  side: StockTradeSide;
  quantity: string;
  price: string;
  exchangeRate: string;
  fee: string;
  note: string;
};
