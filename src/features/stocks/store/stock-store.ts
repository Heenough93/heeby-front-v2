"use client";

import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Stock } from "@/features/stocks/lib/shared/stock-core-types";
import {
  stockSnapshotEditorSchema,
  type StockSnapshotEditorSchemaValues
} from "@/features/stocks/lib/snapshots/stock-snapshot-schema";
import type {
  StockSnapshot,
  StockSnapshotEditorValues,
  StockSnapshotItem
} from "@/features/stocks/lib/snapshots/stock-snapshot-types";
import { normalizeTicker } from "@/features/stocks/lib/snapshots/stock-snapshot-utils";
import {
  stockTradeBatchSchema,
  type StockTradeBatchValues
} from "@/features/stocks/lib/trades/stock-trade-schema";
import type {
  StockTradeDraftRow,
  StockTradeEntry
} from "@/features/stocks/lib/trades/stock-trade-types";
import {
  stockIpoBatchSchema,
  type StockIpoBatchValues
} from "@/features/stocks/lib/ipos/stock-ipo-schema";
import type {
  StockIpoDraftRow,
  StockIpoEntry
} from "@/features/stocks/lib/ipos/stock-ipo-types";
import {
  createEmptyTradeRow,
  sortTradeEntries
} from "@/features/stocks/lib/trades/stock-trade-utils";
import {
  createEmptyIpoRow,
  sortIpoEntries
} from "@/features/stocks/lib/ipos/stock-ipo-utils";
import {
  stockSnapshotItems as initialStockSnapshotItems,
  stockSnapshots as initialStockSnapshots,
  stocks as initialStocks
} from "@/mocks/stocks";
import { stockTradeEntries as initialStockTradeEntries } from "@/mocks/stock-trades";
import { stockIpoEntries as initialStockIpoEntries } from "@/mocks/stock-ipos";

function sortSnapshots(snapshots: StockSnapshot[]) {
  return [...snapshots].sort((a, b) => {
    if (a.weekKey === b.weekKey) {
      return dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf();
    }

    return a.weekKey < b.weekKey ? 1 : -1;
  });
}

function resolveSnapshotScope(params: {
  snapshotId: string;
  snapshotItems: StockSnapshotItem[];
  stocks: Stock[];
}) {
  const firstItem = params.snapshotItems.find((item) => item.snapshotId === params.snapshotId);

  if (!firstItem) {
    return "KR" as const;
  }

  const stockMarket =
    params.stocks.find((stock) => stock.id === firstItem.stockId)?.market ?? "KR";

  return stockMarket === "US" ? "US" : "KR";
}

type StockStore = {
  stocks: Stock[];
  snapshots: StockSnapshot[];
  snapshotItems: StockSnapshotItem[];
  tradeEntries: StockTradeEntry[];
  ipoEntries: StockIpoEntry[];
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
  refreshTradePrices: (
    updates: Array<{ id: string; currentPrice: number; updatedAt: string }>
  ) => void;
  getTradeEntryById: (id: string) => StockTradeEntry | undefined;
  getTradeDraftRowById: (id: string) => StockTradeDraftRow | undefined;
  removeTradeEntry: (id: string) => void;
  addIpoEntries: (values: StockIpoBatchValues) => StockIpoEntry[];
  updateIpoEntry: (
    id: string,
    values: StockIpoBatchValues["entries"][number]
  ) => StockIpoEntry | undefined;
  getIpoEntryById: (id: string) => StockIpoEntry | undefined;
  getIpoDraftRowById: (id: string) => StockIpoDraftRow | undefined;
  removeIpoEntry: (id: string) => void;
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
    marketScope: parsedValues.marketScope,
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
      ipoEntries: sortIpoEntries(initialStockIpoEntries),
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
          positionStatus: entry.positionStatus,
          quantity: Number(entry.quantity),
          buyPrice: Number(entry.buyPrice),
          currentPrice: entry.currentPrice ? Number(entry.currentPrice) : undefined,
          currentPriceUpdatedAt: entry.currentPrice ? now : undefined,
          soldAt: entry.soldAt || undefined,
          sellPrice: entry.sellPrice ? Number(entry.sellPrice) : undefined,
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
          positionStatus: nextInput.positionStatus,
          quantity: Number(nextInput.quantity),
          buyPrice: Number(nextInput.buyPrice),
          currentPrice: nextInput.currentPrice ? Number(nextInput.currentPrice) : undefined,
          currentPriceUpdatedAt: nextInput.currentPrice ? dayjs().toISOString() : undefined,
          soldAt: nextInput.soldAt || undefined,
          sellPrice: nextInput.sellPrice ? Number(nextInput.sellPrice) : undefined,
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
      refreshTradePrices: (updates) =>
        set((state) => ({
          tradeEntries: sortTradeEntries(
            state.tradeEntries.map((entry) => {
              const nextUpdate = updates.find((update) => update.id === entry.id);

              if (!nextUpdate || entry.positionStatus !== "open") {
                return entry;
              }

              return {
                ...entry,
                currentPrice: nextUpdate.currentPrice,
                currentPriceUpdatedAt: nextUpdate.updatedAt,
                updatedAt: nextUpdate.updatedAt
              };
            })
          )
        })),
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
          positionStatus: entry.positionStatus,
          quantity: String(entry.quantity),
          buyPrice: String(entry.buyPrice),
          currentPrice: entry.currentPrice ? String(entry.currentPrice) : "",
          soldAt: entry.soldAt ?? "",
          sellPrice: entry.sellPrice ? String(entry.sellPrice) : "",
          fee: entry.fee ? String(entry.fee) : "",
          note: entry.note ?? ""
        };
      },
      removeTradeEntry: (id) =>
        set((state) => ({
          tradeEntries: state.tradeEntries.filter((entry) => entry.id !== id)
        })),
      addIpoEntries: (values) => {
        const parsed = stockIpoBatchSchema.parse(values);
        const now = dayjs().toISOString();
        const nextEntries = parsed.entries.map((entry) => ({
          id: nanoid(),
          ownerScope: entry.ownerScope,
          stockName: entry.stockName.trim(),
          brokerage: entry.brokerage.trim(),
          subscribedAt: entry.subscribedAt,
          deposit: Number(entry.deposit),
          allocatedQuantity: Number(entry.allocatedQuantity),
          refundedAt: entry.refundedAt || undefined,
          refundAmount: entry.refundAmount ? Number(entry.refundAmount) : undefined,
          subscriptionFee: entry.subscriptionFee ? Number(entry.subscriptionFee) : undefined,
          listedAt: entry.listedAt || undefined,
          sellAmount: entry.sellAmount ? Number(entry.sellAmount) : undefined,
          settledAt: entry.settledAt || undefined,
          taxAndFee: entry.taxAndFee ? Number(entry.taxAndFee) : undefined,
          createdAt: now,
          updatedAt: now
        })) satisfies StockIpoEntry[];

        set((state) => ({
          ipoEntries: sortIpoEntries([...nextEntries, ...state.ipoEntries])
        }));

        return nextEntries;
      },
      updateIpoEntry: (id, values) => {
        const parsed = stockIpoBatchSchema.parse({ entries: [values] });
        const currentEntry = get().ipoEntries.find((entry) => entry.id === id);

        if (!currentEntry) {
          return undefined;
        }

        const [nextInput] = parsed.entries;
        const nextEntry: StockIpoEntry = {
          ...currentEntry,
          ownerScope: nextInput.ownerScope,
          stockName: nextInput.stockName.trim(),
          brokerage: nextInput.brokerage.trim(),
          subscribedAt: nextInput.subscribedAt,
          deposit: Number(nextInput.deposit),
          allocatedQuantity: Number(nextInput.allocatedQuantity),
          refundedAt: nextInput.refundedAt || undefined,
          refundAmount: nextInput.refundAmount ? Number(nextInput.refundAmount) : undefined,
          subscriptionFee: nextInput.subscriptionFee ? Number(nextInput.subscriptionFee) : undefined,
          listedAt: nextInput.listedAt || undefined,
          sellAmount: nextInput.sellAmount ? Number(nextInput.sellAmount) : undefined,
          settledAt: nextInput.settledAt || undefined,
          taxAndFee: nextInput.taxAndFee ? Number(nextInput.taxAndFee) : undefined,
          updatedAt: dayjs().toISOString()
        };

        set((state) => ({
          ipoEntries: sortIpoEntries(
            state.ipoEntries.map((entry) => (entry.id === id ? nextEntry : entry))
          )
        }));

        return nextEntry;
      },
      getIpoEntryById: (id) => get().ipoEntries.find((entry) => entry.id === id),
      getIpoDraftRowById: (id) => {
        const entry = get().ipoEntries.find((item) => item.id === id);

        if (!entry) {
          return undefined;
        }

        return {
          ...createEmptyIpoRow(entry.subscribedAt),
          id: entry.id,
          ownerScope: entry.ownerScope,
          stockName: entry.stockName,
          brokerage: entry.brokerage,
          subscribedAt: entry.subscribedAt,
          deposit: String(entry.deposit),
          allocatedQuantity: String(entry.allocatedQuantity),
          refundedAt: entry.refundedAt ?? "",
          refundAmount: entry.refundAmount !== undefined ? String(entry.refundAmount) : "",
          subscriptionFee:
            entry.subscriptionFee !== undefined ? String(entry.subscriptionFee) : "",
          listedAt: entry.listedAt ?? "",
          sellAmount: entry.sellAmount !== undefined ? String(entry.sellAmount) : "",
          settledAt: entry.settledAt ?? "",
          taxAndFee: entry.taxAndFee !== undefined ? String(entry.taxAndFee) : ""
        };
      },
      removeIpoEntry: (id) =>
        set((state) => ({
          ipoEntries: state.ipoEntries.filter((entry) => entry.id !== id)
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
          tradeEntries: sortTradeEntries(initialStockTradeEntries),
          ipoEntries: sortIpoEntries(initialStockIpoEntries)
        })
    }),
    {
      name: "heeby-stock-store",
      version: 11,
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<StockStore> | undefined;

        if (!state) {
          return persistedState as StockStore;
        }

        const nextState: Partial<StockStore> = { ...state };

        if (version < 3) {
          nextState.tradeEntries = sortTradeEntries(initialStockTradeEntries);
        }

        if (version < 4) {
          const nextStocks = nextState.stocks ?? initialStocks;
          const nextSnapshotItems = nextState.snapshotItems ?? initialStockSnapshotItems;
          nextState.snapshots = sortSnapshots(
            (nextState.snapshots ?? initialStockSnapshots).map((snapshot) => ({
              ...snapshot,
              marketScope:
                "marketScope" in snapshot && snapshot.marketScope
                  ? snapshot.marketScope
                  : resolveSnapshotScope({
                      snapshotId: snapshot.id,
                      snapshotItems: nextSnapshotItems,
                      stocks: nextStocks
                    })
            })) as StockSnapshot[]
          );
        }

        if (version < 5) {
          nextState.tradeEntries = sortTradeEntries(initialStockTradeEntries);
        }

        if (version < 6) {
          nextState.tradeEntries = sortTradeEntries(
            (nextState.tradeEntries ?? initialStockTradeEntries).map((entry) => ({
              ...entry,
              currentPriceUpdatedAt:
                "currentPriceUpdatedAt" in entry ? entry.currentPriceUpdatedAt : undefined
            })) as StockTradeEntry[]
          );
        }

        if (version < 7) {
          nextState.tradeEntries = sortTradeEntries(
            (nextState.tradeEntries ?? initialStockTradeEntries).map((entry) => {
              const nextEntry = { ...entry } as Record<string, unknown>;
              delete nextEntry.exchangeRate;
              return nextEntry as StockTradeEntry;
            })
          );
        }

        if (version < 8) {
          nextState.ipoEntries = sortIpoEntries(initialStockIpoEntries);
        }

        if (version < 9) {
          nextState.ipoEntries = sortIpoEntries(
            (nextState.ipoEntries ?? initialStockIpoEntries).map((entry) => {
              const { fundingSource: _fundingSource, ...nextEntry } = entry as StockIpoEntry & {
                fundingSource?: unknown;
              };
              return nextEntry as StockIpoEntry;
            })
          );
        }

        if (version < 10) {
          nextState.ipoEntries = sortIpoEntries(
            (nextState.ipoEntries ?? initialStockIpoEntries).map((entry, index) => ({
              ...entry,
              ownerScope:
                "ownerScope" in entry && entry.ownerScope
                  ? entry.ownerScope
                  : index % 2 === 0
                    ? "yumja"
                    : "heeby"
            })) as StockIpoEntry[]
          );
        }

        if (version < 11) {
          nextState.ipoEntries = sortIpoEntries(
            (nextState.ipoEntries ?? initialStockIpoEntries).map((entry) => {
              const { sharePrice: _sharePrice, ...nextEntry } = entry as StockIpoEntry & {
                sharePrice?: unknown;
              };
              return nextEntry as StockIpoEntry;
            })
          );
        }

        return nextState as StockStore;
      },
      storage: createJSONStorage(() => localStorage)
    }
  )
);
