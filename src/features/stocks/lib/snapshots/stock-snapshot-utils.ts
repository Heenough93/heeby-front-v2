import dayjs from "dayjs";
import { nanoid } from "nanoid";
import type { Stock, StockMarket } from "@/features/stocks/lib/shared/stock-core-types";
import {
  type StockSnapshot,
  type StockSnapshotDraftItem,
  type StockSnapshotEditorValues,
  type StockSnapshotItem,
  type StockSnapshotScope
} from "@/features/stocks/lib/snapshots/stock-snapshot-types";

export function getIsoWeekKey(input = dayjs()) {
  const date = input.toDate();
  const utcDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNumber = utcDate.getUTCDay() || 7;

  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNumber);

  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(
    ((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );

  return `${utcDate.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

export function getStockSnapshotWeekOptions(input = dayjs()) {
  return Array.from({ length: 7 }, (_, index) => {
    const offset = index - 4;
    const weekKey = getIsoWeekKey(input.add(offset, "week"));
    const suffix = offset === 0 ? "이번 주" : offset < 0 ? `${Math.abs(offset)}주 전` : `${offset}주 후`;

    return {
      value: weekKey,
      label: `${weekKey} (${suffix})`
    };
  });
}

export function createDefaultStockSnapshotValues(): StockSnapshotEditorValues {
  return createDefaultStockSnapshotValuesByScope("KR");
}

export function createDefaultStockSnapshotValuesByScope(
  marketScope: StockSnapshotScope
): StockSnapshotEditorValues {
  const weekKey = getIsoWeekKey();

  return {
    title: createStockSnapshotTitle(marketScope),
    weekKey,
    marketScope,
    comment: "",
    items: []
  };
}

export function createStockSnapshotTitle(marketScope: StockSnapshotScope, input = dayjs()) {
  return `${getStockSnapshotScopeLabel(marketScope)} - ${input.format("MM월 DD일")}`;
}

export function cloneDraftItem(
  item: Partial<StockSnapshotDraftItem> = {}
): StockSnapshotDraftItem {
  return {
    id: item.id ?? nanoid(),
    stockId: item.stockId,
    name: item.name ?? "",
    ticker: item.ticker ?? "",
    market: item.market ?? "US",
    sector: item.sector ?? "",
    marketCap: item.marketCap ?? "",
    price: item.price ?? "",
    note: item.note ?? ""
  };
}

export function createDraftFromSnapshot(params: {
  snapshot: StockSnapshot;
  items: StockSnapshotItem[];
  stocks: Stock[];
}): StockSnapshotEditorValues {
  const stockById = new Map(params.stocks.map((stock) => [stock.id, stock]));

  return {
    title: params.snapshot.title,
    weekKey: params.snapshot.weekKey,
    marketScope: params.snapshot.marketScope,
    comment: params.snapshot.comment ?? "",
    sourceSnapshotId: params.snapshot.sourceSnapshotId,
    items: [...params.items]
      .sort((a, b) => a.rank - b.rank)
      .map((item) => {
        const stock = stockById.get(item.stockId);

        return cloneDraftItem({
          id: nanoid(),
          stockId: stock?.id,
          name: stock?.name ?? "",
          ticker: stock?.ticker ?? "",
          market: stock?.market ?? "US",
          sector: stock?.sector ?? "",
          marketCap: item.marketCap ?? "",
          price: item.price ?? "",
          note: item.note ?? ""
        });
      })
  };
}

export function createDraftFromLatestSnapshot(params: {
  latestSnapshot?: StockSnapshot;
  items: StockSnapshotItem[];
  stocks: Stock[];
  marketScope?: StockSnapshotScope;
}): StockSnapshotEditorValues {
  if (!params.latestSnapshot) {
    return createDefaultStockSnapshotValuesByScope(params.marketScope ?? "KR");
  }

  return {
    ...createDraftFromSnapshot({
      snapshot: params.latestSnapshot,
      items: params.items,
      stocks: params.stocks
    }),
    title: createStockSnapshotTitle(params.latestSnapshot.marketScope),
    weekKey: getIsoWeekKey(),
    sourceSnapshotId: params.latestSnapshot.id
  };
}

export function createDraftFromSourceSnapshot(params: {
  sourceSnapshot?: StockSnapshot;
  items: StockSnapshotItem[];
  stocks: Stock[];
  marketScope?: StockSnapshotScope;
}) {
  if (!params.sourceSnapshot) {
    return createDefaultStockSnapshotValuesByScope(params.marketScope ?? "KR");
  }

  return {
    ...createDraftFromSnapshot({
      snapshot: params.sourceSnapshot,
      items: params.items,
      stocks: params.stocks
    }),
    title: createStockSnapshotTitle(params.sourceSnapshot.marketScope),
    weekKey: getIsoWeekKey(),
    sourceSnapshotId: params.sourceSnapshot.id
  };
}

export function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex) {
    return items;
  }

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, movedItem);

  return nextItems;
}

export function getStockMarketLabel(market: StockMarket) {
  switch (market) {
    case "KR":
      return "국내";
    case "US":
      return "미국";
    case "ETF":
      return "ETF";
    case "OTHER":
      return "기타";
  }
}

export function getStockSnapshotScopeLabel(scope: StockSnapshotScope) {
  return scope === "KR" ? "한국시장" : "미국시장";
}

export function normalizeTicker(ticker: string) {
  return ticker.trim().toUpperCase();
}

export function formatSnapshotUpdatedAt(input: string) {
  return dayjs(input).format("YYYY.MM.DD HH:mm");
}
