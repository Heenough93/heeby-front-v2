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
