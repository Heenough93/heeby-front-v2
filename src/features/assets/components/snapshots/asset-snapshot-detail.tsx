"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getOwnerScopeLabel } from "@/types/domain";
import { canManageAsset } from "@/features/access/lib/access-policy";
import {
  getAccessMode,
  useAccessStore
} from "@/features/access/store/access-store";
import {
  getAssetSnapshotChanges,
  getAssetSnapshotOuts
} from "@/features/assets/lib/asset-snapshot-compare";
import {
  formatAssetAmount,
  formatAssetSnapshotUpdatedAt,
  getAssetSnapshotCategoryBreakdown,
  getAssetSnapshotCategoryLabel,
  getAssetSnapshotMajorTypeLabel,
  getAssetSnapshotOwnerTotals,
  getAssetSnapshotTotalAmount
} from "@/features/assets/lib/asset-snapshot-utils";
import { useAssetStore } from "@/features/assets/store/asset-store";
import { useToastStore } from "@/stores/ui/use-toast-store";
import type { AssetSnapshotItem } from "@/features/assets/lib/asset-snapshot-types";

type AssetSnapshotDetailProps = {
  snapshotId: string;
};

const emptyItems: AssetSnapshotItem[] = [];

export function AssetSnapshotDetail({ snapshotId }: AssetSnapshotDetailProps) {
  const router = useRouter();
  const accessMode = useAccessStore(getAccessMode);
  const getSnapshotById = useAssetStore((state) => state.getSnapshotById);
  const getSnapshotItems = useAssetStore((state) => state.getSnapshotItems);
  const snapshots = useAssetStore((state) => state.snapshots);
  const removeSnapshot = useAssetStore((state) => state.removeSnapshot);
  const showToast = useToastStore((state) => state.showToast);
  const snapshot = getSnapshotById(snapshotId);
  const currentItems = getSnapshotItems(snapshotId);
  const currentIndex = snapshots.findIndex((candidate) => candidate.id === snapshotId);
  const previousSnapshot = currentIndex === -1 ? undefined : snapshots[currentIndex + 1];
  const nextSnapshot = currentIndex <= 0 ? undefined : snapshots[currentIndex - 1];
  const previousItems = previousSnapshot ? getSnapshotItems(previousSnapshot.id) : emptyItems;
  const changes = getAssetSnapshotChanges({
    currentItems,
    previousItems
  });
  const outs = getAssetSnapshotOuts({
    currentItems,
    previousItems
  });

  if (!snapshot) {
    return (
      <section className="rounded-[28px] border border-dashed border-line/15 bg-surface p-10 text-center shadow-card">
        <p className="text-lg font-semibold">스냅샷을 찾을 수 없습니다.</p>
      </section>
    );
  }

  const ownerTotals = getAssetSnapshotOwnerTotals(currentItems);
  const breakdown = getAssetSnapshotCategoryBreakdown(currentItems);
  const yumjaChanges = changes.filter((entry) => entry.item.ownerScope === "yumja");
  const heebyChanges = changes.filter((entry) => entry.item.ownerScope === "heeby");
  const yumjaOuts = outs.filter((item) => item.ownerScope === "yumja");
  const heebyOuts = outs.filter((item) => item.ownerScope === "heeby");

  return (
    <section className="grid gap-6">
      <div className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
                {snapshot.monthKey}
              </span>
              <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/68">
                항목 {currentItems.length}개
              </span>
            </div>
            <h2 className="mt-4 text-3xl font-bold">{snapshot.title}</h2>
            <p className="mt-3 text-sm text-ink/58">
              마지막 수정 {formatAssetSnapshotUpdatedAt(snapshot.updatedAt)}
            </p>
          </div>

          {canManageAsset(accessMode) ? (
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/assets/snapshots/new?sourceId=${snapshot.id}`}
                className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                이 스냅샷 복사
              </Link>
              <Link
                href={`/assets/snapshots/${snapshot.id}/edit`}
                className="rounded-full border border-line/10 bg-paper px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
              >
                수정
              </Link>
              <button
                type="button"
                onClick={() => {
                  removeSnapshot(snapshot.id);
                  showToast({
                    title: "자산 스냅샷을 삭제했습니다.",
                    variant: "success"
                  });
                  router.push("/assets/snapshots");
                }}
                className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
              >
                삭제
              </button>
            </div>
          ) : null}
        </div>

        {snapshot.memo ? (
          <p className="mt-6 rounded-[24px] border border-line/10 bg-paper p-5 text-sm leading-6 text-ink/65">
            {snapshot.memo}
          </p>
        ) : null}

        {previousSnapshot || nextSnapshot ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink/58">
            {previousSnapshot ? <span>비교 기준: {previousSnapshot.monthKey}</span> : null}
            {previousSnapshot ? (
              <Link
                href={`/assets/snapshots/${previousSnapshot.id}`}
                className="rounded-full border border-line/10 bg-paper px-3 py-1.5 text-xs font-semibold transition hover:border-coral/35 hover:bg-soft"
              >
                이전 달 보기
              </Link>
            ) : null}
            {nextSnapshot ? (
              <Link
                href={`/assets/snapshots/${nextSnapshot.id}`}
                className="rounded-full border border-line/10 bg-paper px-3 py-1.5 text-xs font-semibold transition hover:border-coral/35 hover:bg-soft"
              >
                이후 달 보기
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="전체 총합" value={formatAssetAmount(getAssetSnapshotTotalAmount(currentItems))} />
        <SummaryCard label="윰자 총합" value={formatAssetAmount(ownerTotals.yumja)} />
        <SummaryCard label="희비 총합" value={formatAssetAmount(ownerTotals.heeby)} />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <OwnerSection
          title="윰자"
          cash={breakdown.yumja.cash}
          invest={breakdown.yumja.invest}
          retirement={breakdown.yumja.retirement}
          changes={yumjaChanges}
          outs={yumjaOuts}
        />
        <OwnerSection
          title="희비"
          cash={breakdown.heeby.cash}
          invest={breakdown.heeby.invest}
          retirement={breakdown.heeby.retirement}
          changes={heebyChanges}
          outs={heebyOuts}
        />
      </div>
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
      <p className="text-sm font-semibold text-ink/58">{label}</p>
      <p className="mt-3 text-2xl font-bold">{value}</p>
    </div>
  );
}

function SmallSummary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-line/10 bg-paper p-4">
      <p className="text-xs font-semibold text-ink/52">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
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

function OwnerSection({
  title,
  cash,
  invest,
  retirement,
  changes,
  outs
}: {
  title: string;
  cash: number;
  invest: number;
  retirement: number;
  changes: Array<{
    item: AssetSnapshotItem;
    change: { type: "same" | "new" | "up" | "down"; label: string };
  }>;
  outs: AssetSnapshotItem[];
}) {
  return (
    <section className="grid gap-4">
      <div className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <h3 className="text-2xl font-bold">{title}</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <SmallSummary label="현금" value={formatAssetAmount(cash)} />
          <SmallSummary label="투자" value={formatAssetAmount(invest)} />
          <SmallSummary label="노후" value={formatAssetAmount(retirement)} />
        </div>
      </div>

      {changes.map(({ item, change }) => (
        <article
          key={item.id}
          className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-semibold">{item.label}</h3>
                <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-ink/68">
                  {getAssetSnapshotMajorTypeLabel(item.majorType)}
                </span>
                <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-ink/68">
                  {getAssetSnapshotCategoryLabel(item.category)}
                </span>
                <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-ink/68">
                  {item.institution}
                </span>
              </div>
              <p className="mt-3 text-sm text-ink/60">잔액 {formatAssetAmount(item.amount)}</p>
            </div>
            <span className={changeBadgeClassName(change.type)}>{change.label}</span>
          </div>
        </article>
      ))}

      {outs.length ? (
        <section className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
            Out
          </p>
          <h3 className="mt-2 text-2xl font-bold">이번 달 제외된 항목</h3>
          <div className="mt-5 grid gap-3">
            {outs.map((item) => (
              <div
                key={item.id}
                className="rounded-[22px] border border-line/10 bg-paper p-4 text-sm text-ink/64"
              >
                {item.institution} · {item.label}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
