"use client";

import Link from "next/link";
import {
  getCurrentMoneyFlowMonthKey,
  sortMoneyFlowSnapshots
} from "@/features/assets/lib/money-flow-utils";
import { useMoneyFlowStore } from "@/features/assets/store/money-flow-store";
import {
  EmptyStateCard,
  getMoneyFlowHref
} from "@/features/assets/components/money-flow/money-flow-shared";
import { getOwnerScopeLabel, type OwnerScope } from "@/types/domain";

export function MoneyFlowMonthlyFlows({ ownerScope }: { ownerScope: OwnerScope }) {
  const snapshots = useMoneyFlowStore((state) => state.snapshots);
  const transfers = useMoneyFlowStore((state) => state.transfers);
  const scopedSnapshots = sortMoneyFlowSnapshots(
    snapshots.filter((snapshot) => snapshot.ownerScope === ownerScope)
  );
  const ownerLabel = getOwnerScopeLabel(ownerScope);

  if (scopedSnapshots.length === 0) {
    return (
      <EmptyStateCard
        eyebrow="월간흐름"
        title="아직 보관된 월간 흐름이 없습니다."
        description="새 달 시작 버튼으로 월간 현금 흐름 다이어그램을 만들면 이 화면에 월별로 보관됩니다."
      >
        <Link
          href={getMoneyFlowHref("/assets/money-flow", ownerScope)}
          className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          대시보드로 이동
        </Link>
      </EmptyStateCard>
    );
  }

  return (
    <section className="grid gap-4">
      <div className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <p className="text-sm font-semibold text-coral">월간흐름</p>
        <h2 className="mt-2 text-2xl font-bold">월별 현금 흐름 보관함</h2>
        <p className="mt-2 text-sm leading-6 text-ink/62">
          {ownerLabel} 기준으로 생성된 월간 현금 흐름 다이어그램을 보관합니다.
        </p>
      </div>

      <div className="grid gap-3">
        {scopedSnapshots.map((snapshot) => {
          const snapshotTransfers = transfers.filter(
            (transfer) => transfer.snapshotId === snapshot.id
          );
          const completedCount = snapshotTransfers.filter((transfer) => transfer.isChecked).length;
          const currentMonthKey = getCurrentMoneyFlowMonthKey();

          return (
            <article
              key={snapshot.id}
              className="flex flex-col gap-4 rounded-[28px] border border-line/10 bg-surface p-5 shadow-card md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold">
                    {snapshot.title}
                  </h3>
                  {snapshot.monthKey === currentMonthKey ? (
                    <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
                      이번 달
                    </span>
                  ) : null}
                  <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/58">
                    {getMoneyFlowSnapshotStatusLabel(snapshot.status)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink/58">
                  실행 항목 {completedCount}/{snapshotTransfers.length}개 완료
                </p>
              </div>

              <Link
                href={getMoneyFlowHref("/assets/money-flow/monthly", ownerScope)}
                className="rounded-full border border-line/10 bg-paper px-5 py-3 text-center text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
              >
                월간 체크 보기
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function getMoneyFlowSnapshotStatusLabel(status: string) {
  switch (status) {
    case "draft":
      return "준비중";
    case "ready":
      return "준비 완료";
    case "inProgress":
      return "진행 중";
    case "done":
      return "완료";
    default:
      return status;
  }
}
