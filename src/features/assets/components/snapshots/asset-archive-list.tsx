"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { canManageAsset } from "@/features/access/lib/access-policy";
import {
  getAccessMode,
  useAccessStore
} from "@/features/access/store/access-store";
import {
  formatAssetAmount,
  formatAssetSnapshotUpdatedAt,
  getAssetSnapshotTotalAmount
} from "@/features/assets/lib/asset-snapshot-utils";
import { useAssetStore } from "@/features/assets/store/asset-store";

export function AssetArchiveList() {
  const accessMode = useAccessStore(getAccessMode);
  const snapshots = useAssetStore((state) => state.snapshots);
  const getSnapshotItems = useAssetStore((state) => state.getSnapshotItems);
  const [search, setSearch] = useState("");
  const canCreateSnapshot = canManageAsset(accessMode);

  const filteredSnapshots = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return snapshots.filter((snapshot) => {
      if (!normalizedSearch) {
        return true;
      }

      const summary = getSnapshotItems(snapshot.id)
        .slice(0, 5)
        .map((item) => `${item.institution} ${item.label}`)
        .join(" ");

      return `${snapshot.title} ${snapshot.monthKey} ${summary}`
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [getSnapshotItems, search, snapshots]);

  return (
    <section className="grid gap-6">
      <div className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink/75">검색</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="월, 제목, 기관, 라벨"
            className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-surface"
          />
        </label>
      </div>

      <div className="grid gap-4">
        {filteredSnapshots.map((snapshot) => {
          const items = getSnapshotItems(snapshot.id);

          return (
            <Link
              key={snapshot.id}
              href={`/assets/snapshots/${snapshot.id}`}
              className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card transition hover:-translate-y-0.5 hover:border-coral/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
                    {snapshot.monthKey}
                  </span>
                  <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/68">
                    항목 {items.length}개
                  </span>
                  <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-ink/68">
                    총합 {formatAssetAmount(getAssetSnapshotTotalAmount(items))}
                  </span>
                </div>
                <span className="text-xs text-ink/48">
                  {formatAssetSnapshotUpdatedAt(snapshot.updatedAt)}
                </span>
              </div>

              <h2 className="mt-4 text-xl font-semibold">{snapshot.title}</h2>
              {snapshot.memo ? (
                <p className="mt-2 text-sm leading-6 text-ink/64">{snapshot.memo}</p>
              ) : null}
            </Link>
          );
        })}
      </div>

      {filteredSnapshots.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-line/15 bg-surface p-10 text-center shadow-card">
          <p className="text-lg font-semibold">
            {search ? "검색 결과가 없습니다." : "아직 저장된 자산 스냅샷이 없습니다."}
          </p>
          <p className="mt-2 text-sm text-ink/60">
            {search
              ? "검색어를 바꾸거나 전체 목록으로 돌아가보세요."
              : canCreateSnapshot
                ? "첫 자산기록을 만들면 차트와 월별 비교를 바로 시작할 수 있습니다."
                : "아직 확인할 수 있는 자산기록이 없습니다."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="rounded-full border border-line/10 bg-paper px-5 py-3 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
              >
                검색어 초기화
              </button>
            ) : null}
            {!search && canCreateSnapshot ? (
              <Link
                href="/assets/snapshots/new"
                className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                새 스냅샷 만들기
              </Link>
            ) : null}
            {!search ? (
              <Link
                href="/assets/charts"
                className="rounded-full border border-line/10 bg-paper px-5 py-3 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
              >
                차트 보기
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
