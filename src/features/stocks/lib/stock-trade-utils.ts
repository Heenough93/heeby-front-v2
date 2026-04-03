import dayjs from "dayjs";
import { nanoid } from "nanoid";
import type {
  StockTradeAccountType,
  StockTradeDraftRow,
  StockTradeEntry,
  StockTradeSide
} from "@/features/stocks/lib/stock-types";

export function createEmptyTradeRow(date = dayjs().format("YYYY-MM-DD")): StockTradeDraftRow {
  return {
    id: nanoid(),
    tradedAt: date,
    accountName: "",
    accountType: "general",
    stockName: "",
    ticker: "",
    market: "KR",
    side: "buy",
    quantity: "",
    price: "",
    exchangeRate: "",
    fee: "",
    note: ""
  };
}

export function getTradeMonthKey(tradedAt: string) {
  return dayjs(tradedAt).format("YYYY-MM");
}

export function getTradeAmount(entry: Pick<StockTradeEntry, "quantity" | "price">) {
  return entry.quantity * entry.price;
}

export function getTradeAmountKrw(
  entry: Pick<StockTradeEntry, "market" | "quantity" | "price" | "exchangeRate">
) {
  const baseAmount = getTradeAmount(entry);

  if (entry.market !== "US") {
    return baseAmount;
  }

  return baseAmount * (entry.exchangeRate ?? 0);
}

export function formatTradeCurrency(value: number) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2
  }).format(value);
}

export function getTradeAccountTypeLabel(type: StockTradeAccountType) {
  switch (type) {
    case "general":
      return "일반";
    case "isa":
      return "ISA";
    case "pension":
      return "연금";
    case "overseas":
      return "해외";
    case "ipo":
      return "공모주";
  }
}

export function getTradeSideLabel(side: StockTradeSide) {
  return side === "buy" ? "매수" : "매도";
}

export function sortTradeEntries(entries: StockTradeEntry[]) {
  return [...entries].sort((a, b) => {
    if (a.tradedAt === b.tradedAt) {
      return dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf();
    }

    return a.tradedAt < b.tradedAt ? 1 : -1;
  });
}
