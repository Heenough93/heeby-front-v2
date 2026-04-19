"use client";

import React, { useState } from "react";
import {
  formatMoneyFlowAmount,
  getMoneyFlowAccountRoleLabel,
  sortMoneyFlowAccounts
} from "@/features/assets/lib/money-flow-utils";
import {
  moneyFlowAccountRoleValues,
  type MoneyFlowAccountInput,
  type MoneyFlowAccountRole
} from "@/features/assets/lib/money-flow-types";
import { useMoneyFlowStore } from "@/features/assets/store/money-flow-store";
import {
  EditorCard,
  EmptyStateCard,
  Field,
  InlineNotice
} from "@/features/assets/components/money-flow/money-flow-shared";
import { getOwnerScopeLabel, type OwnerScope } from "@/types/domain";

function getDefaultAccountInput(ownerScope: OwnerScope): MoneyFlowAccountInput {
  return {
    ownerScope,
    name: "",
    role: "living",
    bankName: "",
    currentBalance: 0,
    targetAmount: 0,
    isActive: true,
    note: ""
  };
}

export function MoneyFlowAccounts({
  ownerScope,
  canManage
}: {
  ownerScope: OwnerScope;
  canManage: boolean;
}) {
  const defaultAccountInput = getDefaultAccountInput(ownerScope);
  const accounts = useMoneyFlowStore((state) => state.accounts);
  const addAccount = useMoneyFlowStore((state) => state.addAccount);
  const updateAccount = useMoneyFlowStore((state) => state.updateAccount);
  const deleteAccount = useMoneyFlowStore((state) => state.deleteAccount);
  const moveAccount = useMoneyFlowStore((state) => state.moveAccount);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MoneyFlowAccountInput>(defaultAccountInput);
  const sortedAccounts = sortMoneyFlowAccounts(
    accounts.filter((account) => account.ownerScope === ownerScope)
  );

  React.useEffect(() => {
    setEditingId(null);
    setForm(getDefaultAccountInput(ownerScope));
  }, [ownerScope]);

  const handleSubmit = () => {
    if (!canManage) {
      return;
    }

    if (!form.name.trim()) {
      return;
    }

    if (editingId) {
      updateAccount(editingId, form);
      setEditingId(null);
    } else {
      addAccount(form);
    }

    setForm(defaultAccountInput);
  };

  return (
    <section className="grid gap-6">
      {!canManage ? (
        <InlineNotice tone="muted">현재 권한에서는 통장 목록을 조회할 수만 있습니다.</InlineNotice>
      ) : (
        <EditorCard
          title={editingId ? "통장 수정" : "통장 추가"}
          description={`${getOwnerScopeLabel(ownerScope)} 현금 흐름에서 쓰는 돈의 역할 박스를 관리합니다.`}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="이름">
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="예: 생활비"
                className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral"
              />
            </Field>
            <Field label="역할">
              <select
                value={form.role}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    role: event.target.value as MoneyFlowAccountRole
                  }))
                }
                className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral"
              >
                {moneyFlowAccountRoleValues.map((role) => (
                  <option key={role} value={role}>
                    {getMoneyFlowAccountRoleLabel(role)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="은행명">
              <input
                value={form.bankName ?? ""}
                onChange={(event) => setForm((current) => ({ ...current, bankName: event.target.value }))}
                placeholder="예: 카카오뱅크"
                className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral"
              />
            </Field>
            <Field label="현재 잔액">
              <input
                type="number"
                value={form.currentBalance}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    currentBalance: Number(event.target.value || 0)
                  }))
                }
                className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral"
              />
            </Field>
            <Field label="목표 금액">
              <input
                type="number"
                value={form.targetAmount ?? 0}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    targetAmount: Number(event.target.value || 0)
                  }))
                }
                className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral"
              />
            </Field>
            <Field label="메모">
              <input
                value={form.note ?? ""}
                onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                placeholder="역할 메모"
                className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral"
              />
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {editingId ? "통장 저장" : "통장 추가"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(defaultAccountInput);
                }}
                className="rounded-full border border-line/10 bg-paper px-5 py-3 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
              >
                취소
              </button>
            ) : null}
          </div>
        </EditorCard>
      )}

      <section className="grid gap-4">
        {sortedAccounts.length === 0 ? (
          <EmptyStateCard
            eyebrow="통장 관리"
            title="아직 등록된 통장이 없습니다."
            description="급여계좌와 목적별 통장을 먼저 등록해야 배분 규칙과 월간 체크를 만들 수 있습니다. 실제 은행 계좌번호보다 돈의 역할을 기준으로 추가하세요."
          />
        ) : null}

        {sortedAccounts.map((account, index) => (
          <article key={account.id} className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold">{account.name}</h2>
                  <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-ink/68">
                    {getMoneyFlowAccountRoleLabel(account.role)}
                  </span>
                  {!account.isActive ? (
                    <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/52">
                      비활성
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm text-ink/62">
                  잔액 {formatMoneyFlowAmount(account.currentBalance)}
                  {account.targetAmount !== undefined
                    ? ` · 목표 ${formatMoneyFlowAmount(account.targetAmount)}`
                    : ""}
                </p>
                {account.bankName ? <p className="mt-1 text-sm text-ink/52">{account.bankName}</p> : null}
              </div>

              {canManage ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveAccount(account.id, "up")}
                    className="rounded-full border border-line/10 bg-paper px-3 py-2 text-xs font-semibold transition hover:border-coral/35 hover:bg-soft disabled:opacity-40"
                  >
                    위로
                  </button>
                  <button
                    type="button"
                    disabled={index === sortedAccounts.length - 1}
                    onClick={() => moveAccount(account.id, "down")}
                    className="rounded-full border border-line/10 bg-paper px-3 py-2 text-xs font-semibold transition hover:border-coral/35 hover:bg-soft disabled:opacity-40"
                  >
                    아래로
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(account.id);
                      setForm({
                        ownerScope,
                        name: account.name,
                        role: account.role,
                        bankName: account.bankName,
                        currentBalance: account.currentBalance,
                        targetAmount: account.targetAmount,
                        isActive: account.isActive,
                        note: account.note
                      });
                    }}
                    className="rounded-full border border-line/10 bg-paper px-3 py-2 text-xs font-semibold transition hover:border-coral/35 hover:bg-soft"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteAccount(account.id)}
                    className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                  >
                    삭제
                  </button>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}
