import type { StockMarket } from "@/features/stocks/lib/shared/stock-core-types";

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
