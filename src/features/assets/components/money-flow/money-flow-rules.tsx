"use client";

import React, { useMemo, useState } from "react";
import {
  formatMoneyFlowAmount,
  sortMoneyFlowAccounts,
  sortMoneyFlowRules
} from "@/features/assets/lib/money-flow-utils";
import type {
  MoneyFlowRuleInput,
  MoneyFlowRuleType
} from "@/features/assets/lib/money-flow-types";
import { useMoneyFlowStore } from "@/features/assets/store/money-flow-store";
import {
  EditorCard,
  EmptyStateCard,
  Field,
  InlineNotice
} from "@/features/assets/components/money-flow/money-flow-shared";
import { getOwnerScopeLabel, type OwnerScope } from "@/types/domain";

function getDefaultRuleInput(ownerScope: OwnerScope): MoneyFlowRuleInput {
  return {
    ownerScope,
    fromAccountId: "",
    toAccountId: "",
    amountType: "fixed",
    amount: 0,
    isActive: true,
    note: ""
  };
}

export function MoneyFlowRules({
  ownerScope,
  canManage
}: {
  ownerScope: OwnerScope;
  canManage: boolean;
}) {
  const accounts = useMoneyFlowStore((state) => state.accounts);
  const rules = useMoneyFlowStore((state) => state.rules);
  const monthlyEntries = useMoneyFlowStore((state) => state.monthlyEntries);
  const addRule = useMoneyFlowStore((state) => state.addRule);
  const updateRule = useMoneyFlowStore((state) => state.updateRule);
  const deleteRule = useMoneyFlowStore((state) => state.deleteRule);
  const moveRule = useMoneyFlowStore((state) => state.moveRule);
  const [editingId, setEditingId] = useState<string | null>(null);
  const scopedAccounts = accounts.filter((account) => account.ownerScope === ownerScope);
  const scopedMonthlyEntries = monthlyEntries.filter(
    (entry) => entry.ownerScope === ownerScope
  );
  const sortedRules = sortMoneyFlowRules(
    rules.filter((rule) => rule.ownerScope === ownerScope)
  );
  const activeAccounts = sortMoneyFlowAccounts(scopedAccounts).filter((account) => account.isActive);
  const defaultFromAccountId = activeAccounts[0]?.id ?? "";
  const defaultToAccountId = activeAccounts[1]?.id ?? activeAccounts[0]?.id ?? "";
  const canCreateRule = activeAccounts.length >= 2;
  const [form, setForm] = useState<MoneyFlowRuleInput>(() => ({
    ...getDefaultRuleInput(ownerScope),
    fromAccountId: defaultFromAccountId,
    toAccountId: defaultToAccountId
  }));
  const hasRemainderRule = sortedRules.some(
    (rule) =>
      rule.amountType === "remainder" &&
      rule.fromAccountId === form.fromAccountId &&
      rule.id !== editingId
  );

  React.useEffect(() => {
    setEditingId(null);
    setForm({
      ...getDefaultRuleInput(ownerScope),
      fromAccountId: defaultFromAccountId,
      toAccountId: defaultToAccountId
    });
  }, [ownerScope, defaultFromAccountId, defaultToAccountId]);

  const accountById = useMemo(
    () => new Map(scopedAccounts.map((account) => [account.id, account])),
    [scopedAccounts]
  );

  const handleSubmit = () => {
    if (!canManage) {
      return;
    }

    if (!canCreateRule || !form.fromAccountId || !form.toAccountId || form.fromAccountId === form.toAccountId) {
      return;
    }

    if (form.amountType === "remainder" && hasRemainderRule) {
      return;
    }

    if (editingId) {
      updateRule(editingId, form);
      setEditingId(null);
    } else {
      addRule(form);
    }

    setForm({
      ...getDefaultRuleInput(ownerScope),
      fromAccountId: defaultFromAccountId,
      toAccountId: defaultToAccountId
    });
  };

  return (
    <section className="grid gap-6">
      {!canManage ? (
        <InlineNotice tone="muted">현재 권한에서는 배분 규칙을 조회할 수만 있습니다.</InlineNotice>
      ) : (
        <EditorCard
          title={editingId ? "규칙 수정" : "규칙 추가"}
          description={`${getOwnerScopeLabel(ownerScope)} 현금 흐름의 기본 배분 순서를 관리합니다.`}
        >
          {!canCreateRule ? (
            <InlineNotice>
              배분 규칙을 만들려면 활성 통장이 최소 2개 필요합니다. 먼저 통장 관리에서 급여계좌와 도착 계좌가 될 통장을 추가하세요.
            </InlineNotice>
          ) : null}
          {hasRemainderRule ? (
            <InlineNotice>
              잔여 규칙은 하나만 둘 수 있습니다. 기존 잔여 규칙을 수정하거나 삭제한 뒤 추가하세요.
            </InlineNotice>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="출발 계좌">
              <select
                value={form.fromAccountId}
                onChange={(event) => setForm((current) => ({ ...current, fromAccountId: event.target.value }))}
                disabled={!canCreateRule}
                className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral"
              >
                {activeAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="도착 계좌">
              <select
                value={form.toAccountId}
                onChange={(event) => setForm((current) => ({ ...current, toAccountId: event.target.value }))}
                disabled={!canCreateRule}
                className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral"
              >
                {activeAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="금액 방식">
              <select
                value={form.amountType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    amountType: event.target.value as MoneyFlowRuleType
                  }))
                }
                disabled={!canCreateRule}
                className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral"
              >
                <option value="fixed">고정 금액</option>
                <option value="remainder" disabled={hasRemainderRule}>
                  잔여
                </option>
              </select>
            </Field>
            <Field label="금액">
              <input
                type="number"
                value={form.amount}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    amount: Number(event.target.value || 0)
                  }))
                }
                disabled={!canCreateRule}
                className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral"
              />
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!canCreateRule}
              onClick={handleSubmit}
              className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {editingId ? "규칙 저장" : "규칙 추가"}
            </button>
          </div>
        </EditorCard>
      )}

      <section className="grid gap-4">
        {sortedRules.length === 0 ? (
          <EmptyStateCard
            eyebrow="배분 규칙"
            title="아직 등록된 배분 규칙이 없습니다."
            description={
              canCreateRule
                ? "급여계좌에서 생활비, 고정지출, 카드결제, 여윳돈 통장으로 돈이 이동하는 순서를 추가하세요."
                : "규칙을 만들기 전에 통장 관리에서 활성 통장을 최소 2개 등록해야 합니다."
            }
          />
        ) : null}

        {sortedRules.map((rule, index) => {
          const fromAccount = accountById.get(rule.fromAccountId);
          const toAccount = accountById.get(rule.toAccountId);
          const plannedAmount =
            scopedMonthlyEntries.find((entry) => entry.ruleId === rule.id)?.plannedAmount ??
            rule.amount;

          return (
            <article key={rule.id} className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
                      {rule.order}차
                    </span>
                    <h2 className="text-xl font-semibold">
                      {fromAccount?.name} → {toAccount?.name}
                    </h2>
                  </div>
                  <p className="mt-3 text-sm text-ink/62">
                    {rule.amountType === "remainder"
                      ? "남은 금액 전체를 이동합니다."
                      : `${formatMoneyFlowAmount(plannedAmount)} 배분`}
                  </p>
                </div>

                {canManage ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveRule(rule.id, "up")}
                      className="rounded-full border border-line/10 bg-paper px-3 py-2 text-xs font-semibold transition hover:border-coral/35 hover:bg-soft disabled:opacity-40"
                    >
                      위로
                    </button>
                    <button
                      type="button"
                      disabled={index === sortedRules.length - 1}
                      onClick={() => moveRule(rule.id, "down")}
                      className="rounded-full border border-line/10 bg-paper px-3 py-2 text-xs font-semibold transition hover:border-coral/35 hover:bg-soft disabled:opacity-40"
                    >
                      아래로
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(rule.id);
                        setForm({
                          ownerScope,
                          fromAccountId: rule.fromAccountId,
                          toAccountId: rule.toAccountId,
                          amountType: rule.amountType,
                          amount: rule.amount,
                          isActive: rule.isActive,
                          note: rule.note
                        });
                      }}
                      className="rounded-full border border-line/10 bg-paper px-3 py-2 text-xs font-semibold transition hover:border-coral/35 hover:bg-soft"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRule(rule.id)}
                      className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                    >
                      삭제
                    </button>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </section>
    </section>
  );
}
