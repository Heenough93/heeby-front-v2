import dayjs from "dayjs";
import { nanoid } from "nanoid";
import type {
  StockIpoDraftRow,
  StockIpoEntry
} from "@/features/stocks/lib/ipos/stock-ipo-types";

export function createEmptyIpoRow(date = dayjs().format("YYYY-MM-DD")): StockIpoDraftRow {
  return {
    id: nanoid(),
    ownerScope: "yumja",
    stockName: "",
    brokerage: "",
    subscribedAt: date,
    deposit: "",
    allocatedQuantity: "",
    refundedAt: "",
    refundAmount: "",
    subscriptionFee: "",
    listedAt: "",
    sellAmount: "",
    settledAt: "",
    taxAndFee: ""
  };
}

export function getIpoMonthKey(subscribedAt: string) {
  return dayjs(subscribedAt).format("YYYY-MM");
}

export function getIpoSharePrice(
  entry: Pick<StockIpoEntry, "deposit" | "refundAmount" | "allocatedQuantity">
) {
  if (entry.allocatedQuantity <= 0) {
    return undefined;
  }

  return (entry.deposit - (entry.refundAmount ?? 0)) / entry.allocatedQuantity;
}

export function getIpoSettlementAmount(
  entry: Pick<
    StockIpoEntry,
    "deposit" | "refundAmount" | "subscriptionFee" | "allocatedQuantity" | "sellAmount" | "taxAndFee"
  >
) {
  const sharePrice = getIpoSharePrice(entry);

  if (sharePrice === undefined) {
    return entry.deposit - (entry.subscriptionFee ?? 0) - (entry.taxAndFee ?? 0);
  }

  return (
    entry.deposit -
    (entry.subscriptionFee ?? 0) +
    (((entry.sellAmount ?? 0) - sharePrice) * entry.allocatedQuantity) -
    (entry.taxAndFee ?? 0)
  );
}

export function getIpoProfit(
  entry: Pick<
    StockIpoEntry,
    "deposit" | "refundAmount" | "subscriptionFee" | "allocatedQuantity" | "sellAmount" | "taxAndFee"
  >
) {
  return (
    -entry.deposit +
    (entry.refundAmount ?? 0) -
    (entry.subscriptionFee ?? 0) +
    (entry.allocatedQuantity * (entry.sellAmount ?? 0)) -
    (entry.taxAndFee ?? 0)
  );
}

export function sortIpoEntries(entries: StockIpoEntry[]) {
  return [...entries].sort((a, b) => {
    if (a.subscribedAt === b.subscribedAt) {
      return dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf();
    }

    return a.subscribedAt < b.subscribedAt ? 1 : -1;
  });
}
