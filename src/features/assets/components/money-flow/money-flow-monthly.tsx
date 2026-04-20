"use client";

import React, { useState } from "react";
import {
  formatMoneyFlowAmount,
  formatMoneyFlowCheckedAt,
  getCurrentMoneyFlowMonthKey,
  getMoneyFlowAccountRoleLabel,
  getMoneyFlowTransferTitle,
  sortMoneyFlowAccounts,
  sortMoneyFlowTransfers
} from "@/features/assets/lib/money-flow-utils";
import { useMoneyFlowStore } from "@/features/assets/store/money-flow-store";
import {
  EditorCard,
  Field,
  InlineNotice,
  MoneyFlowStartMonthEmptyState
} from "@/features/assets/components/money-flow/money-flow-shared";
import { getOwnerScopeLabel, type OwnerScope } from "@/types/domain";
import type { MoneyFlowTransferInput } from "@/features/assets/lib/money-flow-types";

function getDefaultOneOffTransferInput(
  snapshotId: string,
  fromAccountId = "",
  toAccountId = ""
): MoneyFlowTransferInput {
  return {
    snapshotId,
    fromAccountId,
    toAccountId,
    amountType: "fixed",
    plannedAmount: 0,
    actualAmount: 0,
    dayOfMonth: undefined,
    memo: ""
  };
}

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
  const addTransfer = useMoneyFlowStore((state) => state.addTransfer);
  const updateTransfer = useMoneyFlowStore((state) => state.updateTransfer);
  const deleteTransfer = useMoneyFlowStore((state) => state.deleteTransfer);
  const moveTransfer = useMoneyFlowStore((state) => state.moveTransfer);
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
  const activeAccounts = sortMoneyFlowAccounts(
    accounts.filter((account) => account.ownerScope === ownerScope && account.isActive)
  );
  const defaultFromAccountId = activeAccounts[0]?.id ?? "";
  const defaultToAccountId = activeAccounts[1]?.id ?? activeAccounts[0]?.id ?? "";
  const [oneOffForm, setOneOffForm] = useState<MoneyFlowTransferInput>(() =>
    getDefaultOneOffTransferInput("", defaultFromAccountId, defaultToAccountId)
  );

  React.useEffect(() => {
    setOneOffForm((current) => ({
      ...getDefaultOneOffTransferInput(current.snapshotId, defaultFromAccountId, defaultToAccountId),
      plannedAmount: current.plannedAmount,
      actualAmount: current.actualAmount,
      dayOfMonth: current.dayOfMonth,
      memo: current.memo
    }));
  }, [defaultFromAccountId, defaultToAccountId]);

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
  const canCreateOneOffTransfer = canManage && activeAccounts.length >= 2;

  const handleAddOneOffTransfer = () => {
    if (!canCreateOneOffTransfer) {
      return;
    }

    const fromAccountId = oneOffForm.fromAccountId || defaultFromAccountId;
    const toAccountId = oneOffForm.toAccountId || defaultToAccountId;

    if (!fromAccountId || !toAccountId || fromAccountId === toAccountId) {
      return;
    }

    addTransfer({
      ...oneOffForm,
      snapshotId: currentSnapshot.id,
      fromAccountId,
      toAccountId
    });
    setOneOffForm(
      getDefaultOneOffTransferInput(currentSnapshot.id, defaultFromAccountId, defaultToAccountId)
    );
  };

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

      {canManage ? (
        <EditorCard
          title="단발 이체 추가"
          description="이번 달에만 필요한 이체를 추가합니다. 기본 배분 규칙은 변경하지 않습니다."
        >
          {activeAccounts.length < 2 ? (
            <InlineNotice>
              단발 이체를 추가하려면 활성 통장이 최소 2개 필요합니다.
            </InlineNotice>
          ) : null}
          {(oneOffForm.fromAccountId || defaultFromAccountId) ===
          (oneOffForm.toAccountId || defaultToAccountId) ? (
            <InlineNotice>
              출발 계좌와 도착 계좌는 달라야 합니다.
            </InlineNotice>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="출발 계좌">
              <select
                value={oneOffForm.fromAccountId || defaultFromAccountId}
                onChange={(event) =>
                  setOneOffForm((current) => ({
                    ...current,
                    fromAccountId: event.target.value
                  }))
                }
                disabled={!canCreateOneOffTransfer}
                className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral"
              >
                {activeAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} · {getMoneyFlowAccountRoleLabel(account.role)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="도착 계좌">
              <select
                value={oneOffForm.toAccountId || defaultToAccountId}
                onChange={(event) =>
                  setOneOffForm((current) => ({
                    ...current,
                    toAccountId: event.target.value
                  }))
                }
                disabled={!canCreateOneOffTransfer}
                className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral"
              >
                {activeAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} · {getMoneyFlowAccountRoleLabel(account.role)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="예정 금액">
              <input
                type="number"
                value={oneOffForm.plannedAmount}
                onChange={(event) =>
                  setOneOffForm((current) => ({
                    ...current,
                    plannedAmount: Number(event.target.value || 0),
                    actualAmount: Number(event.target.value || 0)
                  }))
                }
                disabled={!canCreateOneOffTransfer}
                className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral"
              />
            </Field>
            <Field label="실행일">
              <input
                type="number"
                min={1}
                max={31}
                value={oneOffForm.dayOfMonth ?? ""}
                onChange={(event) =>
                  setOneOffForm((current) => ({
                    ...current,
                    dayOfMonth: event.target.value ? Number(event.target.value) : undefined
                  }))
                }
                placeholder="예: 25"
                disabled={!canCreateOneOffTransfer}
                className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral"
              />
            </Field>
            <Field label="메모">
              <input
                value={oneOffForm.memo ?? ""}
                onChange={(event) =>
                  setOneOffForm((current) => ({
                    ...current,
                    memo: event.target.value
                  }))
                }
                placeholder="예: 처형 송금"
                disabled={!canCreateOneOffTransfer}
                className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral md:col-span-2"
              />
            </Field>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!canCreateOneOffTransfer}
              onClick={handleAddOneOffTransfer}
              className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              단발 이체 추가
            </button>
          </div>
        </EditorCard>
      ) : null}

      <section className="grid gap-4">
        {currentTransfers.length === 0 ? (
          <article className="rounded-[28px] border border-dashed border-line/15 bg-surface p-8 text-center shadow-card">
            <p className="text-lg font-semibold">이번 달 이체 항목이 없습니다.</p>
            <p className="mt-2 text-sm text-ink/60">
              배분 규칙을 추가한 뒤 새 달을 다시 시작하면 transfer가 생성됩니다.
            </p>
          </article>
        ) : null}

        {currentTransfers.map((transfer, index) => {
          const toAccount = accountById.get(transfer.toAccountId);
          const fromAccount = accountById.get(transfer.fromAccountId);
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
                  {fromAccount?.name ?? "출발 계좌"} → {toAccount?.name ?? "도착 계좌"} · 예정 {formatMoneyFlowAmount(transfer.plannedAmount)} · 실행 {formatMoneyFlowCheckedAt(transfer.checkedAt)}
                </p>
                {transfer.isOneOff ? (
                  <span className="mt-3 inline-flex rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/58">
                    단발 이체
                  </span>
                ) : null}
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
              <Field label="예정 금액">
                <input
                  type="number"
                  value={transfer.plannedAmount}
                  disabled
                  className="h-12 rounded-2xl border border-line/10 bg-soft px-4 text-sm text-ink/58 outline-none"
                />
              </Field>
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
              <Field label="실행일">
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={transfer.dayOfMonth ?? ""}
                  disabled={!canManage}
                  onChange={(event) =>
                    updateTransfer(transfer.id, {
                      dayOfMonth: event.target.value ? Number(event.target.value) : undefined
                    })
                  }
                  placeholder="예: 25"
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
            {canManage ? (
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveTransfer(transfer.id, "up")}
                  className="rounded-full border border-line/10 bg-paper px-4 py-2 text-xs font-semibold transition hover:border-coral/35 hover:bg-soft disabled:opacity-40"
                >
                  위로
                </button>
                <button
                  type="button"
                  disabled={index === currentTransfers.length - 1}
                  onClick={() => moveTransfer(transfer.id, "down")}
                  className="rounded-full border border-line/10 bg-paper px-4 py-2 text-xs font-semibold transition hover:border-coral/35 hover:bg-soft disabled:opacity-40"
                >
                  아래로
                </button>
                {transfer.isOneOff ? (
                <button
                  type="button"
                  onClick={() => deleteTransfer(transfer.id)}
                  className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                >
                  단발 이체 삭제
                </button>
                ) : null}
              </div>
            ) : null}
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
