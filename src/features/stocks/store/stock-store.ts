"use client";

import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  stockSnapshotEditorSchema,
  type StockSnapshotEditorSchemaValues
} from "@/features/stocks/lib/stock-snapshot-schema";
import { normalizeTicker } from "@/features/stocks/lib/stock-snapshot-utils";
import {
  stockTradeBatchSchema,
  type StockTradeBatchValues
} from "@/features/stocks/lib/stock-trade-schema";
import {
  createEmptyTradeRow,
  sortTradeEntries
} from "@/features/stocks/lib/stock-trade-utils";
import type {
  Stock,
  StockSnapshot,
  StockSnapshotEditorValues,
  StockSnapshotItem,
  StockTradeDraftRow,
  StockTradeEntry
} from "@/features/stocks/lib/stock-types";
import {
  stockSnapshotItems as initialStockSnapshotItems,
  stockSnapshots as initialStockSnapshots,
  stocks as initialStocks
} from "@/mocks/stocks";
import { stockTradeEntries as initialStockTradeEntries } from "@/mocks/stock-trades";

function sortSnapshots(snapshots: StockSnapshot[]) {
  return [...snapshots].sort((a, b) => {
    if (a.weekKey === b.weekKey) {
      return dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf();
    }

    return a.weekKey < b.weekKey ? 1 : -1;
  });
}

type StockStore = {
  stocks: Stock[];
  snapshots: StockSnapshot[];
  snapshotItems: StockSnapshotItem[];
  tradeEntries: StockTradeEntry[];
  addSnapshot: (values: StockSnapshotEditorValues) => StockSnapshot;
  updateSnapshot: (
    id: string,
    values: StockSnapshotEditorValues
  ) => StockSnapshot | undefined;
  getSnapshotById: (id: string) => StockSnapshot | undefined;
  getSnapshotItems: (snapshotId: string) => StockSnapshotItem[];
  getLatestSnapshot: () => StockSnapshot | undefined;
  getPreviousSnapshot: (snapshotId: string) => StockSnapshot | undefined;
  getNextSnapshot: (snapshotId: string) => StockSnapshot | undefined;
  addTradeEntries: (values: StockTradeBatchValues) => StockTradeEntry[];
  updateTradeEntry: (
    id: string,
    values: StockTradeBatchValues["entries"][number]
  ) => StockTradeEntry | undefined;
  getTradeEntryById: (id: string) => StockTradeEntry | undefined;
  getTradeDraftRowById: (id: string) => StockTradeDraftRow | undefined;
  removeTradeEntry: (id: string) => void;
  removeSnapshot: (id: string) => void;
  resetStocks: () => void;
};

function resolveStock(
  stocks: Stock[],
  item: StockSnapshotEditorSchemaValues["items"][number],
  now: string
) {
  const normalizedTicker = normalizeTicker(item.ticker);
  const currentStock =
    stocks.find((stock) => stock.id === item.stockId) ??
    stocks.find(
      (stock) =>
        stock.market === item.market &&
        normalizeTicker(stock.ticker) === normalizedTicker
    );

  if (currentStock) {
    return {
      stock: {
        ...currentStock,
        name: item.name.trim(),
        ticker: normalizedTicker,
        market: item.market,
        sector: item.sector?.trim() || undefined,
        updatedAt: now
      } satisfies Stock,
      isNew: false
    };
  }

  return {
    stock: {
      id: nanoid(),
      name: item.name.trim(),
      ticker: normalizedTicker,
      market: item.market,
      sector: item.sector?.trim() || undefined,
      createdAt: now,
      updatedAt: now
    } satisfies Stock,
    isNew: true
  };
}

function buildSnapshotPayload(
  values: StockSnapshotEditorValues,
  currentSnapshot: StockSnapshot | undefined,
  currentStocks: Stock[]
) {
  const parsedValues = stockSnapshotEditorSchema.parse(values);
  const now = dayjs().toISOString();
  const nextSnapshot: StockSnapshot = {
    id: currentSnapshot?.id ?? nanoid(),
    title: parsedValues.title.trim(),
    weekKey: parsedValues.weekKey.trim(),
    comment: parsedValues.comment?.trim() || undefined,
    sourceSnapshotId: parsedValues.sourceSnapshotId,
    createdAt: currentSnapshot?.createdAt ?? now,
    updatedAt: now
  };

  const nextStocks = [...currentStocks];
  const nextSnapshotItems = parsedValues.items.map((item, index) => {
    const resolved = resolveStock(nextStocks, item, now);

    if (resolved.isNew) {
      nextStocks.unshift(resolved.stock);
    } else {
      const stockIndex = nextStocks.findIndex((stock) => stock.id === resolved.stock.id);
      nextStocks.splice(stockIndex, 1, resolved.stock);
    }

    return {
      id: nanoid(),
      snapshotId: nextSnapshot.id,
      stockId: resolved.stock.id,
      rank: index + 1,
      marketCap: item.marketCap?.trim() || undefined,
      price: item.price?.trim() || undefined,
      note: item.note?.trim() || undefined,
      createdAt: now,
      updatedAt: now
    } satisfies StockSnapshotItem;
  });

  return {
    nextSnapshot,
    nextStocks,
    nextSnapshotItems
  };
}

export const useStockStore = create<StockStore>()(
  persist(
    (set, get) => ({
      stocks: initialStocks,
      snapshots: sortSnapshots(initialStockSnapshots),
      snapshotItems: initialStockSnapshotItems,
      tradeEntries: sortTradeEntries(initialStockTradeEntries),
      addSnapshot: (values) => {
        const payload = buildSnapshotPayload(values, undefined, get().stocks);

        set((state) => ({
          stocks: payload.nextStocks,
          snapshots: sortSnapshots([payload.nextSnapshot, ...state.snapshots]),
          snapshotItems: [...state.snapshotItems, ...payload.nextSnapshotItems]
        }));

        return payload.nextSnapshot;
      },
      updateSnapshot: (id, values) => {
        const currentSnapshot = get().snapshots.find((snapshot) => snapshot.id === id);

        if (!currentSnapshot) {
          return undefined;
        }

        const payload = buildSnapshotPayload(values, currentSnapshot, get().stocks);

        set((state) => ({
          stocks: payload.nextStocks,
          snapshots: sortSnapshots(
            state.snapshots.map((snapshot) =>
              snapshot.id === id ? payload.nextSnapshot : snapshot
            )
          ),
          snapshotItems: [
            ...state.snapshotItems.filter((item) => item.snapshotId !== id),
            ...payload.nextSnapshotItems
          ]
        }));

        return payload.nextSnapshot;
      },
      getSnapshotById: (id) => get().snapshots.find((snapshot) => snapshot.id === id),
      getSnapshotItems: (snapshotId) =>
        get()
          .snapshotItems.filter((item) => item.snapshotId === snapshotId)
          .sort((a, b) => a.rank - b.rank),
      getLatestSnapshot: () => get().snapshots[0],
      getPreviousSnapshot: (snapshotId) => {
        const snapshots = get().snapshots;
        const index = snapshots.findIndex((snapshot) => snapshot.id === snapshotId);

        if (index === -1) {
          return undefined;
        }

        return snapshots[index + 1];
      },
      getNextSnapshot: (snapshotId) => {
        const snapshots = get().snapshots;
        const index = snapshots.findIndex((snapshot) => snapshot.id === snapshotId);

        if (index <= 0) {
          return undefined;
        }

        return snapshots[index - 1];
      },
      addTradeEntries: (values) => {
        const parsed = stockTradeBatchSchema.parse(values);
        const now = dayjs().toISOString();
        const nextEntries = parsed.entries.map((entry) => ({
          id: nanoid(),
          tradedAt: entry.tradedAt,
          accountName: entry.accountName.trim(),
          accountType: entry.accountType,
          stockName: entry.stockName.trim(),
          ticker: normalizeTicker(entry.ticker),
          market: entry.market,
          side: entry.side,
          quantity: Number(entry.quantity),
          price: Number(entry.price),
          exchangeRate: entry.exchangeRate ? Number(entry.exchangeRate) : undefined,
          fee: entry.fee ? Number(entry.fee) : undefined,
          note: entry.note?.trim() || undefined,
          createdAt: now,
          updatedAt: now
        })) satisfies StockTradeEntry[];

        set((state) => ({
          tradeEntries: sortTradeEntries([...nextEntries, ...state.tradeEntries])
        }));

        return nextEntries;
      },
      updateTradeEntry: (id, values) => {
        const parsed = stockTradeBatchSchema.parse({ entries: [values] });
        const currentEntry = get().tradeEntries.find((entry) => entry.id === id);

        if (!currentEntry) {
          return undefined;
        }

        const [nextInput] = parsed.entries;
        const nextEntry: StockTradeEntry = {
          ...currentEntry,
          tradedAt: nextInput.tradedAt,
          accountName: nextInput.accountName.trim(),
          accountType: nextInput.accountType,
          stockName: nextInput.stockName.trim(),
          ticker: normalizeTicker(nextInput.ticker),
          market: nextInput.market,
          side: nextInput.side,
          quantity: Number(nextInput.quantity),
          price: Number(nextInput.price),
          exchangeRate: nextInput.exchangeRate ? Number(nextInput.exchangeRate) : undefined,
          fee: nextInput.fee ? Number(nextInput.fee) : undefined,
          note: nextInput.note?.trim() || undefined,
          updatedAt: dayjs().toISOString()
        };

        set((state) => ({
          tradeEntries: sortTradeEntries(
            state.tradeEntries.map((entry) => (entry.id === id ? nextEntry : entry))
          )
        }));

        return nextEntry;
      },
      getTradeEntryById: (id) => get().tradeEntries.find((entry) => entry.id === id),
      getTradeDraftRowById: (id) => {
        const entry = get().tradeEntries.find((item) => item.id === id);

        if (!entry) {
          return undefined;
        }

        return {
          ...createEmptyTradeRow(entry.tradedAt),
          id: entry.id,
          tradedAt: entry.tradedAt,
          accountName: entry.accountName,
          accountType: entry.accountType,
          stockName: entry.stockName,
          ticker: entry.ticker,
          market: entry.market,
          side: entry.side,
          quantity: String(entry.quantity),
          price: String(entry.price),
          exchangeRate: entry.exchangeRate ? String(entry.exchangeRate) : "",
          fee: entry.fee ? String(entry.fee) : "",
          note: entry.note ?? ""
        };
      },
      removeTradeEntry: (id) =>
        set((state) => ({
          tradeEntries: state.tradeEntries.filter((entry) => entry.id !== id)
        })),
      removeSnapshot: (id) =>
        set((state) => ({
          snapshots: state.snapshots.filter((snapshot) => snapshot.id !== id),
          snapshotItems: state.snapshotItems.filter((item) => item.snapshotId !== id)
        })),
      resetStocks: () =>
        set({
          stocks: initialStocks,
          snapshots: sortSnapshots(initialStockSnapshots),
          snapshotItems: initialStockSnapshotItems,
          tradeEntries: sortTradeEntries(initialStockTradeEntries)
        })
    }),
    {
      name: "heeby-stock-store",
      version: 3,
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<StockStore> | undefined;

        if (!state) {
          return persistedState as StockStore;
        }

        if (version < 3) {
          return {
            ...state,
            tradeEntries: sortTradeEntries(initialStockTradeEntries)
          } satisfies Partial<StockStore>;
        }

        return persistedState as StockStore;
      },
      storage: createJSONStorage(() => localStorage)
    }
  )
);
