"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  getStockSnapshotChanges,
  getStockSnapshotOuts
} from "@/features/stocks/lib/snapshots/stock-snapshot-compare";
import { useStockStore } from "@/features/stocks/store/stock-store";
import {
  formatSnapshotUpdatedAt,
  getStockSnapshotScopeLabel
} from "@/features/stocks/lib/snapshots/stock-snapshot-utils";
import type { StockSnapshotScope } from "@/features/stocks/lib/snapshots/stock-snapshot-types";

export function StockArchiveList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const snapshots = useStockStore((state) => state.snapshots);
  const stocks = useStockStore((state) => state.stocks);
  const getSnapshotItems = useStockStore((state) => state.getSnapshotItems);
  const [search, setSearch] = useState("");
  const scopeFilter = (searchParams.get("scope") === "US" ? "US" : "KR") as StockSnapshotScope;

  const stockById = useMemo(
    () => new Map(stocks.map((stock) => [stock.id, stock])),
    [stocks]
  );

  const filteredSnapshots = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return snapshots.filter((snapshot) => {
      if (snapshot.marketScope !== scopeFilter) {
        return false;
      }

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
  }, [getSnapshotItems, scopeFilter, search, snapshots, stockById]);

  const setScopeFilter = (scope: StockSnapshotScope) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("scope", scope);
    router.replace(`${pathname}?${nextParams.toString()}`);
  };

  return (
    <section className="grid gap-6">
      <div className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { value: "KR", label: "한국시장" },
            { value: "US", label: "미국시장" }
          ].map((option) => {
            const isActive = scopeFilter === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setScopeFilter(option.value as StockSnapshotScope)}
                className={
                  isActive
                    ? "rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                    : "rounded-full border border-line/10 bg-paper px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink/75">검색</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="주차, 제목, 종목"
            className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-surface"
          />
        </label>
      </div>

      <div className="grid gap-4">
        {filteredSnapshots.map((snapshot) => {
          const items = getSnapshotItems(snapshot.id);
          const previousSnapshot = filteredSnapshots.find(
            (candidate) =>
              candidate.marketScope === snapshot.marketScope &&
              candidate.weekKey < snapshot.weekKey
          );
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
            .map((entry) => ({
              key: entry.item.id,
              label: `${entry.stock?.name ?? "알 수 없는 종목"} ${entry.change.label}`,
              type: entry.change.type
            }));
          const outBadges = outs.map((entry) => ({
            key: entry.item.id,
            label: `${entry.stock?.name ?? "알 수 없는 종목"} OUT`
          }));

          return (
            <Link
              key={snapshot.id}
              href={`/stocks/snapshots/${snapshot.id}`}
              className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card transition hover:-translate-y-0.5 hover:border-coral/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
                    {snapshot.weekKey}
                  </span>
                  <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-ink/68">
                    {getStockSnapshotScopeLabel(snapshot.marketScope)}
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
                {leadStocks ? `상위 종목: ${leadStocks}` : "등록된 종목이 없습니다."}
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
              : "지난 스냅샷을 불러오거나 새로 시작해보세요."}
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
