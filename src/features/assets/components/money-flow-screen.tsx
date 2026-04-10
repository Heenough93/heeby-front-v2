"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/shared/components/layout/app-shell";
import { ListBackAction } from "@/shared/components/layout/list-back-action";
import {
  buildMoneyFlowLineItems,
  formatMoneyFlowAmount,
  formatMoneyFlowCheckedAt,
  getCurrentMoneyFlowMonthKey,
  getMoneyFlowAccountRoleLabel,
  getMoneyFlowAccountStatus,
  getMoneyFlowDashboardSummary,
  getMoneyFlowRuleTypeLabel,
  getMoneyFlowStatusMessage,
  sortMoneyFlowAccounts,
  sortMoneyFlowMonthlyEntries,
  sortMoneyFlowRules
} from "@/features/assets/lib/money-flow-utils";
import type {
  MoneyFlowAccount,
  MoneyFlowAccountInput,
  MoneyFlowAccountRole,
  MoneyFlowMonthlyEntry,
  MoneyFlowRule,
  MoneyFlowRuleInput,
  MoneyFlowRuleType
} from "@/features/assets/lib/money-flow-types";
import type { AssetSnapshot } from "@/features/assets/lib/asset-snapshot-types";
import { formatAssetSnapshotUpdatedAt } from "@/features/assets/lib/asset-snapshot-utils";
import { useAssetStore } from "@/features/assets/store/asset-store";
import { useMoneyFlowStore } from "@/features/assets/store/money-flow-store";

type MoneyFlowSection = "dashboard" | "accounts" | "rules" | "monthly";

type MoneyFlowScreenProps = {
  section: MoneyFlowSection;
};

const sectionMeta: Record<MoneyFlowSection, { title: string; href: string }> = {
  dashboard: { title: "대시보드", href: "/assets/money-flow" },
  accounts: { title: "통장 관리", href: "/assets/money-flow/accounts" },
  rules: { title: "배분 규칙", href: "/assets/money-flow/rules" },
  monthly: { title: "월간 체크", href: "/assets/money-flow/monthly" }
};

const defaultAccountInput: MoneyFlowAccountInput = {
  name: "",
  role: "living",
  bankName: "",
  currentBalance: 0,
  targetAmount: 0,
  isActive: true,
  note: ""
};

const defaultRuleInput: MoneyFlowRuleInput = {
  fromAccountId: "",
  toAccountId: "",
  amountType: "fixed",
  amount: 0,
  isActive: true,
  note: ""
};

export function MoneyFlowScreen({ section }: MoneyFlowScreenProps) {
  const accounts = useMoneyFlowStore((state) => state.accounts);
  const rules = useMoneyFlowStore((state) => state.rules);
  const monthlyEntries = useMoneyFlowStore((state) => state.monthlyEntries);
  const assetSnapshots = useAssetStore((state) => state.snapshots);

  return (
    <AppShell
      title="현금 흐름"
      actions={<ListBackAction href="/assets" />}
    >
      <MoneyFlowNavigation currentSection={section} />

      {section === "dashboard" ? (
        <MoneyFlowDashboard
          accounts={accounts}
          rules={rules}
          monthlyEntries={monthlyEntries}
          assetSnapshots={assetSnapshots}
        />
      ) : null}
      {section === "accounts" ? <MoneyFlowAccounts /> : null}
      {section === "rules" ? <MoneyFlowRules /> : null}
      {section === "monthly" ? <MoneyFlowMonthly /> : null}
    </AppShell>
  );
}

function MoneyFlowNavigation({
  currentSection
}: {
  currentSection: MoneyFlowSection;
}) {
  return (
    <section className="grid gap-3 md:grid-cols-4">
      {Object.entries(sectionMeta).map(([key, item]) => (
        <Link
          key={key}
          href={item.href}
          className={
            currentSection === key
              ? "rounded-[24px] border border-coral/35 bg-coral/10 px-5 py-4 text-sm font-semibold text-ink shadow-card"
              : "rounded-[24px] border border-line/10 bg-surface px-5 py-4 text-sm font-semibold text-ink transition hover:border-coral/30 hover:bg-soft"
          }
        >
          {item.title}
        </Link>
      ))}
    </section>
  );
}

function MoneyFlowDashboard({
  accounts,
  rules,
  monthlyEntries,
  assetSnapshots
}: {
  accounts: MoneyFlowAccount[];
  rules: MoneyFlowRule[];
  monthlyEntries: MoneyFlowMonthlyEntry[];
  assetSnapshots: AssetSnapshot[];
}) {
  const currentMonthKey = getCurrentMoneyFlowMonthKey();
  const currentMonthEntries = sortMoneyFlowMonthlyEntries(monthlyEntries).filter(
    (entry) => entry.monthKey === currentMonthKey
  );
  const currentMonthSnapshot = assetSnapshots.find(
    (snapshot) => snapshot.monthKey === currentMonthKey
  );
  const latestSnapshot = assetSnapshots[0];

  if (currentMonthEntries.length === 0) {
    return (
      <section className="grid gap-6">
        <MoneyFlowMonthStatusSummary
          hasCurrentMonthFlow={false}
          isMonthlyComplete={false}
          hasCurrentMonthSnapshot={Boolean(currentMonthSnapshot)}
        />
        <MoneyFlowStartMonthEmptyState monthKey={currentMonthKey} />
        <MoneyFlowAssetRecordBridge
          monthKey={currentMonthKey}
          currentMonthSnapshot={currentMonthSnapshot}
          latestSnapshot={latestSnapshot}
          hasCurrentMonthFlow={false}
          isMonthlyComplete={false}
        />
      </section>
    );
  }

  const summary = getMoneyFlowDashboardSummary({ accounts, monthlyEntries: currentMonthEntries });
  const statusMessage = getMoneyFlowStatusMessage(
    currentMonthEntries
  );
  const lineItems = buildMoneyFlowLineItems({
    accounts,
    rules,
    monthlyEntries: currentMonthEntries
  });
  const sortedAccounts = sortMoneyFlowAccounts(accounts).filter((account) => account.isActive);
  const pendingEntries = currentMonthEntries.filter(
    (entry) => !entry.isChecked
  );
  const isMonthlyComplete = pendingEntries.length === 0;

  return (
    <section className="grid gap-6">
      <MoneyFlowMonthStatusSummary
        hasCurrentMonthFlow
        isMonthlyComplete={isMonthlyComplete}
        hasCurrentMonthSnapshot={Boolean(currentMonthSnapshot)}
      />

      <MoneyFlowAssetRecordBridge
        monthKey={currentMonthKey}
        currentMonthSnapshot={currentMonthSnapshot}
        latestSnapshot={latestSnapshot}
        hasCurrentMonthFlow
        isMonthlyComplete={isMonthlyComplete}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          label="이번 달 급여"
          value={formatMoneyFlowAmount(summary.salaryAmount)}
        />
        <SummaryCard
          label="배분 완료율"
          value={`${summary.completedRatio}%`}
        />
        <SummaryCard
          label="남은 할 일"
          value={`${summary.pendingCount}개`}
        />
        <SummaryCard
          label="예상 여윳돈"
          value={formatMoneyFlowAmount(summary.expectedSurplus)}
        />
      </div>

      <section className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <p className="text-sm font-semibold text-coral">이번 달 상태</p>
        <h2 className="mt-3 text-2xl font-bold">{statusMessage}</h2>
        <p className="mt-2 text-sm text-ink/62">
          월초에는 대시보드에서 흐름을 확인하고, 배분 규칙과 월간 체크에서 실행 상태를 업데이트한 뒤 자산기록으로 이어집니다.
        </p>
      </section>

      <section className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-coral">흐름 보기</p>
            <h2 className="mt-2 text-2xl font-bold">자금 흐름 시각화</h2>
          </div>
          <Link
            href="/assets/money-flow/rules"
            className="rounded-full border border-line/10 bg-paper px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
          >
            배분 규칙 보기
          </Link>
        </div>

        <div className="mt-6 grid gap-4">
          {lineItems.map((item) => (
            <div key={item.id} className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <FlowNode title={item.fromAccount?.name ?? "-"} tone="origin" />
              <div className="flex flex-col items-center gap-2 text-sm font-semibold text-ink/62">
                <span>{item.amountType === "remainder" ? "잔여" : formatMoneyFlowAmount(item.amount)}</span>
                <span aria-hidden>↓</span>
              </div>
              <FlowNode title={item.toAccount?.name ?? "-"} tone="target" caption={getMoneyFlowRuleTypeLabel({
                id: item.id,
                fromAccountId: "",
                toAccountId: "",
                amountType: item.amountType,
                amount: item.amount,
                order: 0,
                isActive: true,
                createdAt: "",
                updatedAt: ""
              })} />
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-coral">통장 상태</p>
              <h2 className="mt-2 text-2xl font-bold">계좌별 현재 잔액</h2>
            </div>
            <Link
              href="/assets/money-flow/accounts"
              className="rounded-full border border-line/10 bg-paper px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
          >
              통장 관리 보기
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {sortedAccounts.map((account) => (
              <article
                key={account.id}
                className="rounded-[24px] border border-line/10 bg-paper p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{account.name}</h3>
                    <p className="mt-1 text-xs font-semibold text-ink/52">
                      {getMoneyFlowAccountRoleLabel(account.role)}
                    </p>
                  </div>
                  <span className={getStatusBadgeClassName(getMoneyFlowAccountStatus(account))}>
                    {getMoneyFlowAccountStatus(account) === "warning" ? "부족" : "정상"}
                  </span>
                </div>
                <p className="mt-4 text-2xl font-bold">
                  {formatMoneyFlowAmount(account.currentBalance)}
                </p>
                {account.targetAmount !== undefined ? (
                  <p className="mt-2 text-sm text-ink/60">
                    목표 {formatMoneyFlowAmount(account.targetAmount)}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-coral">이번 달 실행</p>
              <h2 className="mt-2 text-2xl font-bold">이번 달 해야 할 체크리스트</h2>
            </div>
            <Link
              href="/assets/money-flow/monthly"
              className="rounded-full border border-line/10 bg-paper px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
          >
              월간 체크 보기
            </Link>
          </div>

          <div className="mt-6 grid gap-3">
            {pendingEntries.map((entry) => (
              <article
                key={entry.id}
                className="rounded-[22px] border border-amber-200 bg-amber-50/70 p-4"
              >
                <p className="text-sm font-semibold">{entry.title}</p>
                <p className="mt-1 text-sm text-ink/64">
                  예정 {formatMoneyFlowAmount(entry.plannedAmount)}
                </p>
              </article>
            ))}
            {pendingEntries.length === 0 ? (
              <div className="rounded-[22px] border border-line/10 bg-paper p-4 text-sm text-ink/60">
                이번 달 체크리스트가 모두 완료되었습니다.
              </div>
            ) : null}
          </div>
        </section>
      </section>
    </section>
  );
}

function MoneyFlowMonthStatusSummary({
  hasCurrentMonthFlow,
  isMonthlyComplete,
  hasCurrentMonthSnapshot
}: {
  hasCurrentMonthFlow: boolean;
  isMonthlyComplete: boolean;
  hasCurrentMonthSnapshot: boolean;
}) {
  const overallComplete =
    hasCurrentMonthFlow && isMonthlyComplete && hasCurrentMonthSnapshot;

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <StatusSummaryCard
        label="월간 체크"
        title={
          !hasCurrentMonthFlow
            ? "아직 시작 전"
            : isMonthlyComplete
              ? "완료"
              : "진행 중"
        }
        tone={
          !hasCurrentMonthFlow
            ? "muted"
            : isMonthlyComplete
              ? "success"
              : "warning"
        }
        description={
          !hasCurrentMonthFlow
            ? "이번 달 체크리스트를 아직 만들지 않았습니다."
            : isMonthlyComplete
              ? "이번 달 이체 체크리스트가 모두 완료되었습니다."
              : "이번 달 실행 항목이 아직 남아 있습니다."
        }
      />
      <StatusSummaryCard
        label="자산기록"
        title={hasCurrentMonthSnapshot ? "기록 완료" : "아직 기록 안 함"}
        tone={hasCurrentMonthSnapshot ? "success" : "warning"}
        description={
          hasCurrentMonthSnapshot
            ? "이번 달 자산 스냅샷이 저장되어 있습니다."
            : "이번 달 자산기록을 남기면 결과 비교가 쉬워집니다."
        }
      />
      <StatusSummaryCard
        label="이번 달 루틴"
        title={overallComplete ? "모두 완료" : "진행 필요"}
        tone={overallComplete ? "success" : "muted"}
        description={
          overallComplete
            ? "현금 흐름과 자산기록이 모두 연결되었습니다."
            : "현금 흐름 실행과 자산기록 저장을 이어서 진행하세요."
        }
      />
    </section>
  );
}

function StatusSummaryCard({
  label,
  title,
  description,
  tone
}: {
  label: string;
  title: string;
  description: string;
  tone: "success" | "warning" | "muted";
}) {
  const className =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50/80"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50/80"
        : "border-line/10 bg-surface";

  return (
    <article className={`rounded-[28px] border p-6 shadow-card ${className}`}>
      <p className="text-sm font-semibold text-ink/58">{label}</p>
      <h2 className="mt-3 text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink/64">{description}</p>
    </article>
  );
}

function MoneyFlowAssetRecordBridge({
  monthKey,
  currentMonthSnapshot,
  latestSnapshot,
  hasCurrentMonthFlow,
  isMonthlyComplete
}: {
  monthKey: string;
  currentMonthSnapshot?: AssetSnapshot;
  latestSnapshot?: AssetSnapshot;
  hasCurrentMonthFlow: boolean;
  isMonthlyComplete: boolean;
}) {
  if (currentMonthSnapshot) {
    return (
      <section className="rounded-[28px] border border-emerald-200 bg-emerald-50/80 p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-700">자산기록 연결 상태</p>
            <h2 className="mt-2 text-2xl font-bold">
              이번 달 자산기록이 이미 저장되어 있습니다.
            </h2>
            <p className="mt-2 text-sm text-ink/68">
              {monthKey} 자산 스냅샷이 있어 이번 달 현금 흐름 결과를 바로 비교할 수 있습니다.
            </p>
            <p className="mt-3 text-sm font-semibold text-emerald-800">
              마지막 저장 {formatAssetSnapshotUpdatedAt(currentMonthSnapshot.updatedAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/assets/snapshots"
              className="rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
            >
              자산기록 목록
            </Link>
            <Link
              href={`/assets/snapshots/${currentMonthSnapshot.id}`}
              className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              이번 달 자산기록 보기
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!hasCurrentMonthFlow) {
    return (
      <section className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <p className="text-sm font-semibold text-coral">자산기록 연결 상태</p>
        <h2 className="mt-2 text-2xl font-bold">이번 달 현금 흐름을 먼저 시작하세요.</h2>
        <p className="mt-2 text-sm text-ink/62">
          월간 체크를 시작하면 그 결과를 바탕으로 {monthKey} 자산기록까지 자연스럽게 이어갈 수 있습니다.
        </p>
      </section>
    );
  }

  const createHref = latestSnapshot
    ? `/assets/snapshots/new?sourceId=${latestSnapshot.id}&monthKey=${monthKey}`
    : `/assets/snapshots/new?monthKey=${monthKey}`;
  const emphasizeCreateCta = isMonthlyComplete;

  return (
    <section
      className={
        emphasizeCreateCta
          ? "rounded-[28px] border border-coral/30 bg-coral/10 p-6 shadow-card"
          : "rounded-[28px] border border-amber-200 bg-amber-50/80 p-6 shadow-card"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className={emphasizeCreateCta ? "text-sm font-semibold text-coral" : "text-sm font-semibold text-amber-800"}>
            자산기록 연결 상태
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            이번 달 현금 흐름은 시작됐지만 자산기록은 아직 없습니다.
          </h2>
          <p className="mt-2 text-sm text-ink/68">
            {monthKey} 자산기록을 남기면 현금 흐름 실행 결과를 월간 스냅샷과 바로 비교할 수 있습니다.
          </p>
          {isMonthlyComplete ? (
            <p className="mt-3 text-sm font-semibold text-coral">
              이번 달 월간 체크가 완료되었습니다. 지금 자산기록을 남기면 월간 루틴이 마무리됩니다.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/assets/snapshots"
            className="rounded-full border border-line/10 bg-paper px-5 py-3 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
          >
            자산기록 목록
          </Link>
          <Link
            href={createHref}
            className={
              emphasizeCreateCta
                ? "rounded-full bg-coral px-6 py-3.5 text-sm font-semibold text-white shadow-card transition hover:opacity-90"
                : "rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            }
          >
            이번 달 자산기록 만들기
          </Link>
        </div>
      </div>
    </section>
  );
}

function MoneyFlowAccounts() {
  const accounts = useMoneyFlowStore((state) => state.accounts);
  const addAccount = useMoneyFlowStore((state) => state.addAccount);
  const updateAccount = useMoneyFlowStore((state) => state.updateAccount);
  const deleteAccount = useMoneyFlowStore((state) => state.deleteAccount);
  const moveAccount = useMoneyFlowStore((state) => state.moveAccount);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MoneyFlowAccountInput>(defaultAccountInput);
  const sortedAccounts = sortMoneyFlowAccounts(accounts);

  const handleSubmit = () => {
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
      <EditorCard
        title={editingId ? "통장 수정" : "통장 추가"}
        description="은행 계좌보다 돈의 역할 박스에 가깝게 관리합니다."
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
              {["salary", "living", "fixedExpense", "cardPayment", "emergency", "surplus", "saving"].map((role) => (
                <option key={role} value={role}>
                  {getMoneyFlowAccountRoleLabel(role as MoneyFlowAccountRole)}
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

      <section className="grid gap-4">
        {sortedAccounts.map((account, index) => (
          <article
            key={account.id}
            className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card"
          >
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
                {account.bankName ? (
                  <p className="mt-1 text-sm text-ink/52">{account.bankName}</p>
                ) : null}
              </div>

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
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}

function MoneyFlowRules() {
  const accounts = useMoneyFlowStore((state) => state.accounts);
  const rules = useMoneyFlowStore((state) => state.rules);
  const monthlyEntries = useMoneyFlowStore((state) => state.monthlyEntries);
  const addRule = useMoneyFlowStore((state) => state.addRule);
  const updateRule = useMoneyFlowStore((state) => state.updateRule);
  const deleteRule = useMoneyFlowStore((state) => state.deleteRule);
  const moveRule = useMoneyFlowStore((state) => state.moveRule);
  const [editingId, setEditingId] = useState<string | null>(null);
  const sortedRules = sortMoneyFlowRules(rules);
  const activeAccounts = sortMoneyFlowAccounts(accounts).filter((account) => account.isActive);
  const hasRemainderRule = sortedRules.some(
    (rule) => rule.amountType === "remainder" && rule.id !== editingId
  );
  const [form, setForm] = useState<MoneyFlowRuleInput>(() => ({
    ...defaultRuleInput,
    fromAccountId: activeAccounts[0]?.id ?? "",
    toAccountId: activeAccounts[1]?.id ?? activeAccounts[0]?.id ?? ""
  }));

  const accountById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account])),
    [accounts]
  );

  const handleSubmit = () => {
    if (!form.fromAccountId || !form.toAccountId) {
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
      ...defaultRuleInput,
      fromAccountId: activeAccounts[0]?.id ?? "",
      toAccountId: activeAccounts[1]?.id ?? activeAccounts[0]?.id ?? ""
    });
  };

  return (
    <section className="grid gap-6">
      <EditorCard
        title={editingId ? "규칙 수정" : "규칙 추가"}
        description="여기서 자금 배분 순서를 고정하고, 나머지 화면은 실행 결과를 보여줍니다."
      >
        {hasRemainderRule ? (
          <div className="mb-4 rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            잔여 규칙은 하나만 둘 수 있습니다. 기존 잔여 규칙을 수정하거나 삭제한 뒤 추가하세요.
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="출발 계좌">
            <select
              value={form.fromAccountId}
              onChange={(event) => setForm((current) => ({ ...current, fromAccountId: event.target.value }))}
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
            {editingId ? "규칙 저장" : "규칙 추가"}
          </button>
        </div>
      </EditorCard>

      <section className="grid gap-4">
        {sortedRules.map((rule, index) => {
          const fromAccount = accountById.get(rule.fromAccountId);
          const toAccount = accountById.get(rule.toAccountId);
          const plannedAmount =
            monthlyEntries.find((entry) => entry.ruleId === rule.id)?.plannedAmount ??
            rule.amount;

          return (
            <article
              key={rule.id}
              className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card"
            >
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
              </div>
            </article>
          );
        })}
      </section>
    </section>
  );
}

function MoneyFlowMonthly() {
  const startMonthlyFlow = useMoneyFlowStore((state) => state.startMonthlyFlow);
  const monthlyEntries = useMoneyFlowStore((state) => state.monthlyEntries);
  const updateMonthlyEntry = useMoneyFlowStore((state) => state.updateMonthlyEntry);
  const monthKey = getCurrentMoneyFlowMonthKey();
  const entries = sortMoneyFlowMonthlyEntries(monthlyEntries).filter(
    (entry) => entry.monthKey === monthKey
  );

  if (entries.length === 0) {
    return (
      <MoneyFlowStartMonthEmptyState
        monthKey={monthKey}
        title="이번 달 월간 체크가 아직 시작되지 않았습니다."
        description="새 달 시작 버튼을 눌러 이번 달 급여 확인과 이체 체크리스트를 생성하세요."
        actionLabel={`${monthKey} 시작하기`}
        onStart={() => startMonthlyFlow(monthKey)}
      />
    );
  }

  const surplusEntry = entries.find((entry) => entry.title.includes("여윳돈"));

  return (
    <section className="grid gap-6">
      <section className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <p className="text-sm font-semibold text-coral">{monthKey}</p>
        <h2 className="mt-2 text-2xl font-bold">이번 달 실행 체크</h2>
        <p className="mt-2 text-sm text-ink/62">
          기록보다 실행 확인에 집중합니다. 월초에 돈을 이동하면서 체크하고, 월말에는 자산기록으로 결과를 남기면 됩니다.
        </p>
      </section>

      <section className="grid gap-4">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <label className="flex items-center gap-3 text-lg font-semibold">
                  <input
                    type="checkbox"
                    checked={entry.isChecked}
                    onChange={(event) =>
                      updateMonthlyEntry(entry.id, { isChecked: event.target.checked })
                    }
                    className="h-5 w-5 rounded border-line/20 accent-coral"
                  />
                  {entry.title}
                </label>
                <p className="mt-3 text-sm text-ink/62">
                  예정 {formatMoneyFlowAmount(entry.plannedAmount)} · 실행 {formatMoneyFlowCheckedAt(entry.checkedAt)}
                </p>
              </div>

              <span
                className={
                  entry.isChecked
                    ? "rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700"
                    : "rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700"
                }
              >
                {entry.isChecked ? "완료" : "대기"}
              </span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="실제 금액">
                <input
                  type="number"
                  value={entry.actualAmount ?? 0}
                  onChange={(event) =>
                    updateMonthlyEntry(entry.id, {
                      actualAmount: Number(event.target.value || 0)
                    })
                  }
                  className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral"
                />
              </Field>
              <Field label="메모">
                <input
                  value={entry.memo ?? ""}
                  onChange={(event) =>
                    updateMonthlyEntry(entry.id, { memo: event.target.value })
                  }
                  placeholder="실행 메모"
                  className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral"
                />
              </Field>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <p className="text-sm font-semibold text-coral">이번 달 여윳돈</p>
        <p className="mt-3 text-3xl font-bold">
          {formatMoneyFlowAmount(surplusEntry?.actualAmount ?? surplusEntry?.plannedAmount ?? 0)}
        </p>
        <p className="mt-2 text-sm text-ink/62">
          {surplusEntry?.memo ?? "이번 달 최종 여윳돈 메모를 남겨두면 다음 자산기록 해석이 쉬워집니다."}
        </p>
      </section>
    </section>
  );
}

function MoneyFlowStartMonthEmptyState({
  monthKey,
  title = "이번 달 현금 흐름이 아직 시작되지 않았습니다.",
  description = "새 달 시작 버튼을 눌러 현재 배분 규칙 기준으로 이번 달 체크리스트를 생성하세요.",
  actionLabel,
  onStart
}: {
  monthKey: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  onStart?: () => void;
}) {
  const startMonthlyFlow = useMoneyFlowStore((state) => state.startMonthlyFlow);

  return (
    <section className="rounded-[28px] border border-dashed border-line/15 bg-surface p-10 text-center shadow-card">
      <p className="text-sm font-semibold text-coral">{monthKey}</p>
      <h2 className="mt-3 text-2xl font-bold">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-ink/62">{description}</p>
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => {
            if (onStart) {
              onStart();
              return;
            }

            startMonthlyFlow(monthKey);
          }}
          className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {actionLabel ?? `${monthKey} 새 달 시작`}
        </button>
      </div>
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
      <p className="text-sm font-semibold text-ink/58">{label}</p>
      <p className="mt-3 text-2xl font-bold">{value}</p>
    </article>
  );
}

function FlowNode({
  title,
  tone,
  caption
}: {
  title: string;
  tone: "origin" | "target";
  caption?: string;
}) {
  return (
    <div
      className={
        tone === "origin"
          ? "rounded-[24px] border border-line/10 bg-paper p-4"
          : "rounded-[24px] border border-coral/20 bg-coral/5 p-4"
      }
    >
      <p className="text-base font-semibold">{title}</p>
      {caption ? <p className="mt-1 text-xs text-ink/58">{caption}</p> : null}
    </div>
  );
}

function EditorCard({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-ink/62">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-ink/75">{label}</span>
      {children}
    </label>
  );
}

function getStatusBadgeClassName(status: "healthy" | "warning" | "inactive") {
  switch (status) {
    case "healthy":
      return "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700";
    case "warning":
      return "rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700";
    case "inactive":
      return "rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/52";
  }
}
