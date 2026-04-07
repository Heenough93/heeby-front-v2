"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { canManageStock } from "@/features/access/lib/access-policy";
import {
  getAccessMode,
  useAccessStore
} from "@/features/access/store/access-store";
import {
  getStockSnapshotChanges,
  getStockSnapshotOuts
} from "@/features/stocks/lib/snapshots/stock-snapshot-compare";
import {
  formatSnapshotUpdatedAt,
  getStockMarketLabel,
  getStockSnapshotScopeLabel
} from "@/features/stocks/lib/snapshots/stock-snapshot-utils";
import { useStockStore } from "@/features/stocks/store/stock-store";
import { useToastStore } from "@/stores/ui/use-toast-store";
import type { StockSnapshotItem } from "@/features/stocks/lib/snapshots/stock-snapshot-types";

type StockSnapshotDetailProps = {
  snapshotId: string;
};

const emptySnapshotItems: StockSnapshotItem[] = [];

export function StockSnapshotDetail({ snapshotId }: StockSnapshotDetailProps) {
  const router = useRouter();
  const accessMode = useAccessStore(getAccessMode);
  const getSnapshotById = useStockStore((state) => state.getSnapshotById);
  const getSnapshotItems = useStockStore((state) => state.getSnapshotItems);
  const snapshots = useStockStore((state) => state.snapshots);
  const stocks = useStockStore((state) => state.stocks);
  const removeSnapshot = useStockStore((state) => state.removeSnapshot);
  const showToast = useToastStore((state) => state.showToast);
  const snapshot = getSnapshotById(snapshotId);
  const currentItems = getSnapshotItems(snapshotId);
  const scopedSnapshots = snapshots.filter(
    (candidate) => candidate.marketScope === snapshot?.marketScope
  );
  const currentSnapshotIndex = scopedSnapshots.findIndex(
    (candidate) => candidate.id === snapshotId
  );
  const previousSnapshot =
    currentSnapshotIndex === -1 ? undefined : scopedSnapshots[currentSnapshotIndex + 1];
  const nextSnapshot =
    currentSnapshotIndex <= 0 ? undefined : scopedSnapshots[currentSnapshotIndex - 1];
  const previousItems = previousSnapshot
    ? getSnapshotItems(previousSnapshot.id)
    : emptySnapshotItems;

  if (!snapshot) {
    return (
      <section className="rounded-[28px] border border-dashed border-line/15 bg-surface p-10 text-center shadow-card">
        <p className="text-lg font-semibold">스냅샷을 찾을 수 없습니다.</p>
        <p className="mt-2 text-sm text-ink/60">
          저장된 주간 시총 스냅샷이 없거나 이미 삭제되었습니다.
        </p>
      </section>
    );
  }

  const changes = getStockSnapshotChanges({
    currentItems,
    previousItems,
    stocks
  });
  const outs = getStockSnapshotOuts({
    currentItems,
    previousItems,
    stocks
  });

  const handleDelete = () => {
    removeSnapshot(snapshot.id);
    showToast({
      title: "스냅샷을 삭제했습니다.",
      variant: "success"
    });
    router.push(`/stocks/snapshots?scope=${snapshot.marketScope}`);
  };

  return (
    <section className="grid gap-6">
      <div className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
                {snapshot.weekKey}
              </span>
              <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-ink/68">
                {getStockSnapshotScopeLabel(snapshot.marketScope)}
              </span>
              <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/68">
                종목 {currentItems.length}개
              </span>
            </div>
            <h2 className="mt-4 text-3xl font-bold">{snapshot.title}</h2>
            <p className="mt-3 text-sm text-ink/58">
              마지막 수정 {formatSnapshotUpdatedAt(snapshot.updatedAt)}
            </p>
          </div>

          {canManageStock(accessMode) ? (
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/stocks/snapshots/new?sourceId=${snapshot.id}&scope=${snapshot.marketScope}`}
                className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                이 스냅샷 복사
              </Link>
              <Link
                href={`/stocks/snapshots/${snapshot.id}/edit`}
                className="rounded-full border border-line/10 bg-paper px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
              >
                수정
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
              >
                삭제
              </button>
            </div>
          ) : null}
        </div>

        {snapshot.comment ? (
          <p className="mt-6 rounded-[24px] border border-line/10 bg-paper p-5 text-sm leading-6 text-ink/65">
            {snapshot.comment}
          </p>
        ) : null}

        {previousSnapshot || nextSnapshot ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink/58">
            {previousSnapshot ? <span>비교 기준: {previousSnapshot.weekKey} 스냅샷</span> : null}
            {previousSnapshot ? (
              <Link
                href={`/stocks/snapshots/${previousSnapshot.id}`}
                className="rounded-full border border-line/10 bg-paper px-3 py-1.5 text-xs font-semibold transition hover:border-coral/35 hover:bg-soft"
              >
                이전 주 보기
              </Link>
            ) : null}
            {nextSnapshot ? (
              <Link
                href={`/stocks/snapshots/${nextSnapshot.id}`}
                className="rounded-full border border-line/10 bg-paper px-3 py-1.5 text-xs font-semibold transition hover:border-coral/35 hover:bg-soft"
              >
                이후 주 보기
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4">
        {changes.map(({ item, stock, change }) => (
          <article
            key={item.id}
            className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-coral/10 text-sm font-semibold text-coral">
                  {item.rank}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold">{stock?.name ?? "알 수 없는 종목"}</h3>
                    <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/68">
                      {stock?.ticker ?? "-"}
                    </span>
                    {stock ? (
                      <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-ink/68">
                        {getStockMarketLabel(stock.market)}
                      </span>
                    ) : null}
                    {stock?.sector ? (
                      <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-ink/68">
                        {stock.sector}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm text-ink/60">
                    시총 {item.marketCap || "-"} · 현재가 {item.price || "-"}
                  </p>
                  {item.note ? (
                    <p className="mt-3 text-sm leading-6 text-ink/62">{item.note}</p>
                  ) : null}
                </div>
              </div>

              <span
                className={changeBadgeClassName(change.type)}
              >
                {change.label}
              </span>
            </div>
          </article>
        ))}
      </div>

      {outs.length ? (
        <section className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
            Out
          </p>
          <h3 className="mt-2 text-2xl font-bold">이번 주 제외된 종목</h3>
          <div className="mt-5 grid gap-3">
            {outs.map(({ item, stock }) => (
              <div
                key={item.id}
                className="rounded-[22px] border border-line/10 bg-paper p-4 text-sm text-ink/64"
              >
                {item.rank}위 {stock?.name ?? "알 수 없는 종목"} ({stock?.ticker ?? "-"})
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}

function changeBadgeClassName(type: "same" | "new" | "up" | "down") {
  switch (type) {
    case "same":
      return "rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink/62";
    case "new":
      return "rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white";
    case "up":
      return "rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700";
    case "down":
      return "rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700";
  }
}
