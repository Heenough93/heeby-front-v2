import type { Stock } from "@/features/stocks/lib/shared/stock-core-types";
import type { StockSnapshotItem } from "@/features/stocks/lib/snapshots/stock-snapshot-types";

export type StockSnapshotChange =
  | { type: "same"; label: "유지" }
  | { type: "new"; label: "NEW" }
  | { type: "up"; delta: number; label: string }
  | { type: "down"; delta: number; label: string };

export function getStockSnapshotChanges(params: {
  currentItems: StockSnapshotItem[];
  previousItems?: StockSnapshotItem[];
  stocks: Stock[];
}) {
  const previousRanks = new Map(
    (params.previousItems ?? []).map((item) => [item.stockId, item.rank])
  );
  const stockById = new Map(params.stocks.map((stock) => [stock.id, stock]));

  return [...params.currentItems]
    .sort((a, b) => a.rank - b.rank)
    .map((item) => {
      const previousRank = previousRanks.get(item.stockId);
      const stock = stockById.get(item.stockId);

      let change: StockSnapshotChange;

      if (previousRank === undefined) {
        change = { type: "new", label: "NEW" };
      } else if (previousRank === item.rank) {
        change = { type: "same", label: "유지" };
      } else if (previousRank > item.rank) {
        change = {
          type: "up",
          delta: previousRank - item.rank,
          label: `▲ ${previousRank - item.rank}`
        };
      } else {
        change = {
          type: "down",
          delta: item.rank - previousRank,
          label: `▼ ${item.rank - previousRank}`
        };
      }

      return {
        item,
        stock,
        change
      };
    });
}

export function getStockSnapshotOuts(params: {
  currentItems: StockSnapshotItem[];
  previousItems?: StockSnapshotItem[];
  stocks: Stock[];
}) {
  const currentStockIds = new Set(params.currentItems.map((item) => item.stockId));
  const stockById = new Map(params.stocks.map((stock) => [stock.id, stock]));

  return (params.previousItems ?? [])
    .filter((item) => !currentStockIds.has(item.stockId))
    .sort((a, b) => a.rank - b.rank)
    .map((item) => ({
      item,
      stock: stockById.get(item.stockId)
    }));
}
