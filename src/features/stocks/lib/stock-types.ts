export const stockMarketValues = ["KR", "US", "ETF", "OTHER"] as const;

export type StockMarket = (typeof stockMarketValues)[number];

export const stockSnapshotScopeValues = ["KR", "US"] as const;

export type StockSnapshotScope = (typeof stockSnapshotScopeValues)[number];

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

export const stockTradeAccountTypeValues = [
  "general",
  "isa",
  "pension",
  "overseas",
  "ipo"
] as const;

export type StockTradeAccountType = (typeof stockTradeAccountTypeValues)[number];

export const stockTradePositionStatusValues = ["open", "closed"] as const;

export type StockTradePositionStatus = (typeof stockTradePositionStatusValues)[number];

export type StockTradeEntry = {
  id: string;
  tradedAt: string;
  accountName: string;
  accountType: StockTradeAccountType;
  stockName: string;
  ticker: string;
  market: StockMarket;
  positionStatus: StockTradePositionStatus;
  quantity: number;
  buyPrice: number;
  currentPrice?: number;
  currentPriceUpdatedAt?: string;
  soldAt?: string;
  sellPrice?: number;
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
  positionStatus: StockTradePositionStatus;
  quantity: string;
  buyPrice: string;
  currentPrice: string;
  soldAt: string;
  sellPrice: string;
  fee: string;
  note: string;
};
