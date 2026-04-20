"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  formatMoneyFlowAmount,
  formatMoneyFlowCheckedAt,
  getCurrentMoneyFlowMonthKey,
  getNextMoneyFlowMonthKey,
  getMoneyFlowAccountRoleLabel,
  getMoneyFlowSnapshotStatusLabel,
  getMoneyFlowTransferTitle,
  sortMoneyFlowTransfers
} from "@/features/assets/lib/money-flow-utils";
import { useMoneyFlowStore } from "@/features/assets/store/money-flow-store";
import {
  EmptyStateCard,
  getMoneyFlowHref,
  SummaryCard,
  useMoneyFlowOwnerScope
} from "@/features/assets/components/money-flow/money-flow-shared";
import { getOwnerScopeLabel } from "@/types/domain";

export function MoneyFlowMonthlyFlowDetail({ snapshotId }: { snapshotId: string }) {
  const router = useRouter();
  const ownerScope = useMoneyFlowOwnerScope();
  const accounts = useMoneyFlowStore((state) => state.accounts);
  const snapshots = useMoneyFlowStore((state) => state.snapshots);
  const transfers = useMoneyFlowStore((state) => state.transfers);
  const copySnapshotToMonth = useMoneyFlowStore((state) => state.copySnapshotToMonth);
  const snapshot = snapshots.find((candidate) => candidate.id === snapshotId);

  if (!snapshot) {
    return (
      <EmptyStateCard
        eyebrow="월간흐름"
        title="월간 흐름을 찾을 수 없습니다."
        description="삭제되었거나 존재하지 않는 현금 흐름 다이어그램입니다."
      >
        <Link
          href={getMoneyFlowHref("/assets/money-flow/monthly-flows", ownerScope)}
          className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          월간흐름 목록
        </Link>
      </EmptyStateCard>
    );
  }

  const detailOwnerScope = snapshot.ownerScope;
  const ownerLabel = getOwnerScopeLabel(detailOwnerScope);
  const scopedAccounts = accounts.filter(
    (account) => account.ownerScope === detailOwnerScope
  );
  const accountById = new Map(scopedAccounts.map((account) => [account.id, account]));
  const snapshotTransfers = sortMoneyFlowTransfers(
    transfers.filter((transfer) => transfer.snapshotId === snapshot.id)
  );
  const completedCount = snapshotTransfers.filter((transfer) => transfer.isChecked).length;
  const pendingCount = snapshotTransfers.length - completedCount;
  const oneOffCount = snapshotTransfers.filter((transfer) => transfer.isOneOff).length;
  const completionRatio =
    snapshotTransfers.length === 0
      ? 0
      : Math.round((completedCount / snapshotTransfers.length) * 100);
  const isCurrentMonth = snapshot.monthKey === getCurrentMoneyFlowMonthKey();
  const targetMonthKey = getNextMoneyFlowMonthKey(snapshot.monthKey);
  const hasTargetSnapshot = snapshots.some(
    (candidate) =>
      candidate.ownerScope === detailOwnerScope && candidate.monthKey === targetMonthKey
  );

  return (
    <section className="grid gap-6">
      <section className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
                {snapshot.monthKey}
              </span>
              <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/58">
                {ownerLabel}
              </span>
              <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/58">
                {getMoneyFlowSnapshotStatusLabel(snapshot.status)}
              </span>
            </div>
            <h2 className="mt-4 text-3xl font-bold">{snapshot.title}</h2>
            <p className="mt-3 text-sm leading-6 text-ink/62">
              이 달에 확정된 계좌 간 이동 항목과 실행 상태를 확인합니다.
            </p>
            {snapshot.memo ? (
              <p className="mt-4 rounded-[22px] border border-line/10 bg-paper px-5 py-4 text-sm leading-6 text-ink/64">
                {snapshot.memo}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={getMoneyFlowHref("/assets/money-flow/monthly-flows", detailOwnerScope)}
              className="rounded-full border border-line/10 bg-paper px-5 py-3 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
            >
              목록
            </Link>
            {isCurrentMonth ? (
              <Link
                href={getMoneyFlowHref("/assets/money-flow/monthly", detailOwnerScope)}
                className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                월간 체크 보기
              </Link>
            ) : null}
            <button
              type="button"
              disabled={hasTargetSnapshot}
              onClick={() => {
                copySnapshotToMonth(snapshot.id, targetMonthKey);
                router.push(getMoneyFlowHref("/assets/money-flow/monthly-flows", detailOwnerScope));
              }}
              className="rounded-full border border-coral/25 bg-coral/10 px-5 py-3 text-sm font-semibold text-coral transition hover:bg-coral/15 disabled:border-line/10 disabled:bg-paper disabled:text-ink/35"
            >
              {hasTargetSnapshot ? "다음 달 생성됨" : `${targetMonthKey}로 복사`}
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="완료율" value={`${completionRatio}%`} />
        <SummaryCard label="전체 이체" value={`${snapshotTransfers.length}개`} />
        <SummaryCard label="대기 항목" value={`${pendingCount}개`} />
        <SummaryCard label="단발 이체" value={`${oneOffCount}개`} />
      </div>

      <section className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-coral">이체 항목</p>
            <h3 className="mt-2 text-2xl font-bold">계좌 간 이동 목록</h3>
          </div>
          <span className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink/58">
            완료 {completedCount}/{snapshotTransfers.length}
          </span>
        </div>

        <div className="mt-6 grid gap-3">
          {snapshotTransfers.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-line/15 bg-paper p-8 text-center">
              <p className="text-lg font-semibold">등록된 이체 항목이 없습니다.</p>
              <p className="mt-2 text-sm text-ink/60">
                월간 체크 화면에서 단발 이체를 추가하거나 배분 규칙으로 새 흐름을 만들 수 있습니다.
              </p>
            </div>
          ) : null}

          {snapshotTransfers.map((transfer) => {
            const fromAccount = accountById.get(transfer.fromAccountId);
            const toAccount = accountById.get(transfer.toAccountId);
            const title = getMoneyFlowTransferTitle(transfer, toAccount?.name ?? "이체");

            return (
              <article
                key={transfer.id}
                className="rounded-[24px] border border-line/10 bg-paper p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-lg font-semibold">{title}</h4>
                      {transfer.isOneOff ? (
                        <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
                          단발
                        </span>
                      ) : null}
                      {transfer.dayOfMonth ? (
                        <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-ink/58">
                          {transfer.dayOfMonth}일
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-ink/62">
                      {fromAccount?.name ?? "출발 계좌"} → {toAccount?.name ?? "도착 계좌"}
                    </p>
                    <p className="mt-1 text-xs text-ink/48">
                      {fromAccount ? getMoneyFlowAccountRoleLabel(fromAccount.role) : "출발"} →{" "}
                      {toAccount ? getMoneyFlowAccountRoleLabel(toAccount.role) : "도착"}
                    </p>
                    {transfer.memo ? (
                      <p className="mt-3 text-sm leading-6 text-ink/62">{transfer.memo}</p>
                    ) : null}
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold">
                      {transfer.amountType === "remainder"
                        ? "잔여"
                        : formatMoneyFlowAmount(transfer.plannedAmount)}
                    </p>
                    <p className="mt-1 text-xs text-ink/52">
                      실제 {formatMoneyFlowAmount(transfer.actualAmount ?? 0)}
                    </p>
                    <p className="mt-2 text-xs text-ink/52">
                      {formatMoneyFlowCheckedAt(transfer.checkedAt)}
                    </p>
                    <span
                      className={
                        transfer.isChecked
                          ? "mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                          : "mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"
                      }
                    >
                      {transfer.isChecked ? "완료" : "대기"}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}
