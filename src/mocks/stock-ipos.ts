import dayjs from "dayjs";
import type { StockIpoEntry } from "@/features/stocks/lib/stock-types";

const createdAt = dayjs("2026-04-01T09:00:00+09:00").toISOString();

export const stockIpoEntries: StockIpoEntry[] = [
  {
    id: "ipo-1",
    ownerScope: "yumja",
    stockName: "오름테크",
    brokerage: "미래에셋증권",
    subscribedAt: "2026-03-17",
    deposit: 2_000_000,
    allocatedQuantity: 3,
    refundedAt: "2026-03-19",
    refundAmount: 1_610_000,
    subscriptionFee: 2_000,
    listedAt: "2026-03-25",
    sellAmount: 48_000,
    settledAt: "2026-03-27",
    taxAndFee: 350,
    createdAt,
    updatedAt: createdAt
  },
  {
    id: "ipo-2",
    ownerScope: "heeby",
    stockName: "한빛바이오",
    brokerage: "한국투자증권",
    subscribedAt: "2026-02-11",
    deposit: 1_500_000,
    allocatedQuantity: 2,
    refundedAt: "2026-02-13",
    refundAmount: 1_240_000,
    subscriptionFee: 2_000,
    listedAt: "2026-02-18",
    sellAmount: 23_000,
    settledAt: "2026-02-20",
    taxAndFee: 210,
    createdAt,
    updatedAt: createdAt
  },
  {
    id: "ipo-3",
    ownerScope: "yumja",
    stockName: "넥스트로보",
    brokerage: "NH투자증권",
    subscribedAt: "2026-01-20",
    deposit: 3_000_000,
    allocatedQuantity: 0,
    refundedAt: "2026-01-22",
    refundAmount: 3_000_000,
    subscriptionFee: 2_000,
    createdAt,
    updatedAt: createdAt
  }
];
