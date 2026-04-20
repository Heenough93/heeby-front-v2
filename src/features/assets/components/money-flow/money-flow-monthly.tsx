"use client";

import {
  formatMoneyFlowAmount,
  formatMoneyFlowCheckedAt,
  getCurrentMoneyFlowMonthKey,
  getMoneyFlowTransferTitle,
  sortMoneyFlowTransfers
} from "@/features/assets/lib/money-flow-utils";
import { useMoneyFlowStore } from "@/features/assets/store/money-flow-store";
import {
  Field,
  MoneyFlowStartMonthEmptyState
} from "@/features/assets/components/money-flow/money-flow-shared";
import { getOwnerScopeLabel, type OwnerScope } from "@/types/domain";

export function MoneyFlowMonthly({
  ownerScope,
  canManage
}: {
  ownerScope: OwnerScope;
  canManage: boolean;
}) {
  const startMonthlyFlow = useMoneyFlowStore((state) => state.startMonthlyFlow);
  const accounts = useMoneyFlowStore((state) => state.accounts);
  const snapshots = useMoneyFlowStore((state) => state.snapshots);
  const transfers = useMoneyFlowStore((state) => state.transfers);
  const updateTransfer = useMoneyFlowStore((state) => state.updateTransfer);
  const monthKey = getCurrentMoneyFlowMonthKey();
  const currentSnapshot = snapshots.find(
    (snapshot) => snapshot.ownerScope === ownerScope && snapshot.monthKey === monthKey
  );
  const currentTransfers = currentSnapshot
    ? sortMoneyFlowTransfers(
        transfers.filter((transfer) => transfer.snapshotId === currentSnapshot.id)
      )
    : [];
  const accountById = new Map(
    accounts
      .filter((account) => account.ownerScope === ownerScope)
      .map((account) => [account.id, account])
  );

  if (!currentSnapshot) {
    return (
      <MoneyFlowStartMonthEmptyState
        ownerScope={ownerScope}
        monthKey={monthKey}
        title="이번 달 월간 체크가 아직 시작되지 않았습니다."
        description={`${getOwnerScopeLabel(ownerScope)}의 이번 달 현금 흐름 다이어그램과 이체 체크 항목을 생성하세요.`}
        actionLabel={`${monthKey} ${getOwnerScopeLabel(ownerScope)} 시작하기`}
        canManage={canManage}
        onStart={() => startMonthlyFlow(ownerScope, monthKey)}
      />
    );
  }

  const surplusAccountIds = new Set(
    accounts
      .filter((account) => account.ownerScope === ownerScope && account.role === "surplus")
      .map((account) => account.id)
  );
  const surplusTransfer = currentTransfers.find((transfer) =>
    surplusAccountIds.has(transfer.toAccountId)
  );

  return (
    <section className="grid gap-6">
      <section className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <p className="text-sm font-semibold text-coral">{monthKey}</p>
        <h2 className="mt-2 text-2xl font-bold">
          {getOwnerScopeLabel(ownerScope)} 이번 달 실행 체크
        </h2>
        <p className="mt-2 text-sm text-ink/62">
          기록보다 실행 확인에 집중합니다. 월초에 돈을 이동하면서 체크하고, 월말에는 자산기록으로 결과를 남기면 됩니다.
        </p>
      </section>

      <section className="grid gap-4">
        {currentTransfers.length === 0 ? (
          <article className="rounded-[28px] border border-dashed border-line/15 bg-surface p-8 text-center shadow-card">
            <p className="text-lg font-semibold">이번 달 이체 항목이 없습니다.</p>
            <p className="mt-2 text-sm text-ink/60">
              배분 규칙을 추가한 뒤 새 달을 다시 시작하면 transfer가 생성됩니다.
            </p>
          </article>
        ) : null}

        {currentTransfers.map((transfer) => {
          const toAccount = accountById.get(transfer.toAccountId);
          const title = getMoneyFlowTransferTitle(transfer, toAccount?.name ?? "이체");

          return (
          <article key={transfer.id} className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <label className="flex items-center gap-3 text-lg font-semibold">
                  <input
                    type="checkbox"
                    checked={transfer.isChecked}
                    disabled={!canManage}
                    onChange={(event) =>
                      updateTransfer(transfer.id, { isChecked: event.target.checked })
                    }
                    className="h-5 w-5 rounded border-line/20 accent-coral"
                  />
                  {title}
                </label>
                <p className="mt-3 text-sm text-ink/62">
                  예정 {formatMoneyFlowAmount(transfer.plannedAmount)} · 실행 {formatMoneyFlowCheckedAt(transfer.checkedAt)}
                </p>
              </div>

              <span
                className={
                  transfer.isChecked
                    ? "rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700"
                    : "rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700"
                }
              >
                {transfer.isChecked ? "완료" : "대기"}
              </span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="실제 금액">
                <input
                  type="number"
                  value={transfer.actualAmount ?? 0}
                  disabled={!canManage}
                  onChange={(event) =>
                    updateTransfer(transfer.id, {
                      actualAmount: Number(event.target.value || 0)
                    })
                  }
                  className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral"
                />
              </Field>
              <Field label="메모">
                <input
                  value={transfer.memo ?? ""}
                  disabled={!canManage}
                  onChange={(event) =>
                    updateTransfer(transfer.id, { memo: event.target.value })
                  }
                  placeholder="실행 메모"
                  className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral"
                />
              </Field>
            </div>
          </article>
          );
        })}
      </section>

      <section className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <p className="text-sm font-semibold text-coral">이번 달 여윳돈</p>
        <p className="mt-3 text-3xl font-bold">
          {formatMoneyFlowAmount(surplusTransfer?.actualAmount ?? surplusTransfer?.plannedAmount ?? 0)}
        </p>
        <p className="mt-2 text-sm text-ink/62">
          {surplusTransfer?.memo ?? "이번 달 최종 여윳돈 메모를 남겨두면 다음 자산기록 해석이 쉬워집니다."}
        </p>
      </section>
    </section>
  );
}
