"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getStockSnapshotChanges,
  getStockSnapshotOuts
} from "@/features/stocks/lib/stock-snapshot-compare";
import { useStockStore } from "@/features/stocks/store/stock-store";
import { formatSnapshotUpdatedAt } from "@/features/stocks/lib/stock-snapshot-utils";

export function StockArchiveList() {
  const snapshots = useStockStore((state) => state.snapshots);
  const stocks = useStockStore((state) => state.stocks);
  const getSnapshotItems = useStockStore((state) => state.getSnapshotItems);
  const getPreviousSnapshot = useStockStore((state) => state.getPreviousSnapshot);
  const [search, setSearch] = useState("");

  const stockById = useMemo(
    () => new Map(stocks.map((stock) => [stock.id, stock])),
    [stocks]
  );

  const filteredSnapshots = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return snapshots.filter((snapshot) => {
      if (!normalizedSearch) {
        return true;
      }

      const summary = getSnapshotItems(snapshot.id)
        .slice(0, 5)
        .map((item) => stockById.get(item.stockId)?.name ?? "")
        .join(" ");

      return `${snapshot.title} ${snapshot.weekKey} ${summary}`
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [getSnapshotItems, search, snapshots, stockById]);

  return (
    <section className="grid gap-6">
      <div className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink/75">검색</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="주차, 제목, 주요 종목으로 검색"
            className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-surface"
          />
        </label>
      </div>

      <div className="grid gap-4">
        {filteredSnapshots.map((snapshot) => {
          const items = getSnapshotItems(snapshot.id);
          const previousSnapshot = getPreviousSnapshot(snapshot.id);
          const previousItems = previousSnapshot
            ? getSnapshotItems(previousSnapshot.id)
            : undefined;
          const leadStocks = items
            .slice(0, 3)
            .map((item) => stockById.get(item.stockId)?.name ?? "알 수 없는 종목")
            .join(" · ");
          const changes = getStockSnapshotChanges({
            currentItems: items,
            previousItems,
            stocks
          });
          const outs = getStockSnapshotOuts({
            currentItems: items,
            previousItems,
            stocks
          });
          const summaryBadges = changes
            .filter((entry) => entry.change.type !== "same")
            .slice(0, 2)
            .map((entry) => ({
              key: entry.item.id,
              label: `${entry.stock?.ticker ?? "-"} ${entry.change.label}`,
              type: entry.change.type
            }));
          const outBadges = outs.slice(0, 2).map((entry) => ({
            key: entry.item.id,
            label: `${entry.stock?.ticker ?? "-"} OUT`
          }));

          return (
            <Link
              key={snapshot.id}
              href={`/stocks/${snapshot.id}`}
              className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card transition hover:-translate-y-0.5 hover:border-coral/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
                    {snapshot.weekKey}
                  </span>
                  <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/68">
                    종목 {items.length}개
                  </span>
                </div>
                <span className="text-xs text-ink/48">
                  {formatSnapshotUpdatedAt(snapshot.updatedAt)}
                </span>
              </div>

              <h2 className="mt-4 text-xl font-semibold">{snapshot.title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink/64">
                상위 종목: {leadStocks || "아직 종목이 없습니다."}
              </p>
              {summaryBadges.length || outs.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {summaryBadges.map((badge) => (
                    <span
                      key={badge.key}
                      className={badgeClassName(badge.type)}
                    >
                      {badge.label}
                    </span>
                  ))}
                  {outBadges.map((badge) => (
                    <span
                      key={badge.key}
                      className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/62"
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
              ) : null}
              {snapshot.comment ? (
                <p className="mt-3 text-sm leading-6 text-ink/60">{snapshot.comment}</p>
              ) : null}
            </Link>
          );
        })}
      </div>

      {filteredSnapshots.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-line/15 bg-surface p-10 text-center shadow-card">
          <p className="text-lg font-semibold">
            {search ? "검색 결과가 없습니다." : "아직 저장된 스냅샷이 없습니다."}
          </p>
          <p className="mt-2 text-sm text-ink/60">
            {search
              ? "검색어를 바꾸거나 다른 주차를 확인해보세요."
              : "지난주 순위를 불러와 이번 주 시총 관찰을 기록해보세요."}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function badgeClassName(type: "new" | "up" | "down" | "same") {
  switch (type) {
    case "new":
      return "rounded-full bg-coral px-3 py-1 text-xs font-semibold text-white";
    case "up":
      return "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700";
    case "down":
      return "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700";
    case "same":
      return "rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/62";
  }
}
