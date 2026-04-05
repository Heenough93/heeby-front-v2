"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useStockStore } from "@/features/stocks/store/stock-store";

export function StockWidget() {
  const latestSnapshot = useStockStore((state) => state.getLatestSnapshot());
  const getSnapshotItems = useStockStore((state) => state.getSnapshotItems);
  const stocks = useStockStore((state) => state.stocks);

  const stockById = useMemo(
    () => new Map(stocks.map((stock) => [stock.id, stock])),
    [stocks]
  );

  if (!latestSnapshot) {
    return (
      <div className="rounded-[30px] border border-dashed border-line/20 bg-surface p-6 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
          Stocks
        </p>
        <h3 className="mt-2 text-xl font-bold">주간 시총 스냅샷</h3>
        <p className="mt-3 text-sm leading-6 text-ink/62">
          아직 스냅샷이 없습니다. 이번 주 관찰 순위를 첫 기록으로 남겨보세요.
        </p>
      </div>
    );
  }

  const leadStocks = getSnapshotItems(latestSnapshot.id)
    .slice(0, 3)
    .map((item) => stockById.get(item.stockId)?.name ?? "알 수 없는 종목");

  return (
    <Link
      href={`/stocks/snapshots/${latestSnapshot.id}`}
      className="rounded-[30px] border border-line/10 bg-surface p-6 shadow-card transition hover:border-coral/35 hover:bg-soft"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
        Stocks
      </p>
      <h3 className="mt-2 text-xl font-bold">{latestSnapshot.weekKey}</h3>
      <p className="mt-3 text-sm leading-6 text-ink/62">
        최근 스냅샷 상위 종목: {leadStocks.join(" · ")}
      </p>
      {latestSnapshot.comment ? (
        <p className="mt-4 text-sm leading-6 text-ink/60">{latestSnapshot.comment}</p>
      ) : null}
    </Link>
  );
}
