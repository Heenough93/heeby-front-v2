import dayjs from "dayjs";
import { nanoid } from "nanoid";
import type {
  StockTradeAccountType,
  StockTradeDraftRow,
  StockTradeEntry,
  StockTradePositionStatus
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
    positionStatus: "open",
    quantity: "",
    buyPrice: "",
    currentPrice: "",
    soldAt: "",
    sellPrice: "",
    exchangeRate: "",
    fee: "",
    note: ""
  };
}

export function getTradeMonthKey(tradedAt: string) {
  return dayjs(tradedAt).format("YYYY-MM");
}

export function getTradeBuyAmount(entry: Pick<StockTradeEntry, "quantity" | "buyPrice">) {
  return entry.quantity * entry.buyPrice;
}

function applyKrwRate(
  market: StockTradeEntry["market"],
  amount: number,
  exchangeRate?: number
) {
  if (market !== "US") {
    return amount;
  }

  return amount * (exchangeRate ?? 0);
}

export function getTradeBuyAmountKrw(
  entry: Pick<StockTradeEntry, "market" | "quantity" | "buyPrice" | "exchangeRate">
) {
  return applyKrwRate(entry.market, getTradeBuyAmount(entry), entry.exchangeRate);
}

export function getTradeSellAmount(entry: Pick<StockTradeEntry, "quantity" | "sellPrice">) {
  return entry.sellPrice ? entry.quantity * entry.sellPrice : 0;
}

export function getTradeSellAmountKrw(
  entry: Pick<StockTradeEntry, "market" | "quantity" | "sellPrice" | "exchangeRate">
) {
  return applyKrwRate(entry.market, getTradeSellAmount(entry), entry.exchangeRate);
}

export function getTradeCurrentAmount(entry: Pick<StockTradeEntry, "quantity" | "currentPrice">) {
  return entry.currentPrice ? entry.quantity * entry.currentPrice : 0;
}

export function getTradeCurrentAmountKrw(
  entry: Pick<StockTradeEntry, "market" | "quantity" | "currentPrice" | "exchangeRate">
) {
  return applyKrwRate(entry.market, getTradeCurrentAmount(entry), entry.exchangeRate);
}

export function getTradeReferencePrice(entry: Pick<StockTradeEntry, "positionStatus" | "currentPrice" | "sellPrice">) {
  return entry.positionStatus === "closed" ? entry.sellPrice : entry.currentPrice;
}

export function getTradeProfitAmountKrw(
  entry: Pick<
    StockTradeEntry,
    | "market"
    | "positionStatus"
    | "quantity"
    | "buyPrice"
    | "currentPrice"
    | "sellPrice"
    | "exchangeRate"
    | "fee"
  >
) {
  const buyAmountKrw = getTradeBuyAmountKrw(entry);
  const targetAmountKrw =
    entry.positionStatus === "closed"
      ? getTradeSellAmountKrw(entry)
      : getTradeCurrentAmountKrw(entry);
  const referencePrice = getTradeReferencePrice(entry);

  if (!referencePrice) {
    return undefined;
  }

  return targetAmountKrw - buyAmountKrw - (entry.fee ?? 0);
}

export function getTradeProfitRate(
  entry: Pick<
    StockTradeEntry,
    | "market"
    | "positionStatus"
    | "quantity"
    | "buyPrice"
    | "currentPrice"
    | "sellPrice"
    | "exchangeRate"
    | "fee"
  >
) {
  const buyAmountKrw = getTradeBuyAmountKrw(entry);

  if (buyAmountKrw <= 0) {
    return undefined;
  }

  const profitAmountKrw = getTradeProfitAmountKrw(entry);

  if (profitAmountKrw === undefined) {
    return undefined;
  }

  return (profitAmountKrw / buyAmountKrw) * 100;
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

export function getTradePositionStatusLabel(status: StockTradePositionStatus) {
  return status === "open" ? "보유중" : "매도완료";
}

export function formatTradeRate(value?: number) {
  if (value === undefined || !Number.isFinite(value)) {
    return "-";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function sortTradeEntries(entries: StockTradeEntry[]) {
  return [...entries].sort((a, b) => {
    if (a.tradedAt === b.tradedAt) {
      return dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf();
    }

    return a.tradedAt < b.tradedAt ? 1 : -1;
  });
}
