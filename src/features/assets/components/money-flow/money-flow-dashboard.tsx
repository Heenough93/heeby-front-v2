"use client";

import Link from "next/link";
import {
  buildMoneyFlowLineItems,
  formatMoneyFlowAmount,
  getCurrentMoneyFlowMonthKey,
  getMoneyFlowAccountRoleLabel,
  getMoneyFlowAccountStatus,
  getMoneyFlowDashboardSummary,
  getMoneyFlowStatusMessage,
  sortMoneyFlowAccounts,
  sortMoneyFlowMonthlyEntries
} from "@/features/assets/lib/money-flow-utils";
import type {
  MoneyFlowAccount,
  MoneyFlowMonthlyEntry,
  MoneyFlowRule
} from "@/features/assets/lib/money-flow-types";
import type { AssetSnapshot } from "@/features/assets/lib/asset-snapshot-types";
import { formatAssetSnapshotUpdatedAt } from "@/features/assets/lib/asset-snapshot-utils";
import {
  FlowNode,
  getStatusBadgeClassName,
  MoneyFlowStartMonthEmptyState,
  SummaryCard
} from "@/features/assets/components/money-flow/money-flow-shared";

export function MoneyFlowDashboard({
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
  const statusMessage = getMoneyFlowStatusMessage(currentMonthEntries);
  const lineItems = buildMoneyFlowLineItems({
    accounts,
    rules,
    monthlyEntries: currentMonthEntries
  });
  const sortedAccounts = sortMoneyFlowAccounts(accounts).filter((account) => account.isActive);
  const pendingEntries = currentMonthEntries.filter((entry) => !entry.isChecked);
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
        <SummaryCard label="이번 달 급여" value={formatMoneyFlowAmount(summary.salaryAmount)} />
        <SummaryCard label="배분 완료율" value={`${summary.completedRatio}%`} />
        <SummaryCard label="남은 할 일" value={`${summary.pendingCount}개`} />
        <SummaryCard label="예상 여윳돈" value={formatMoneyFlowAmount(summary.expectedSurplus)} />
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
              <FlowNode
                title={item.toAccount?.name ?? "-"}
                tone="target"
                caption={item.amountType === "remainder" ? "잔여" : "고정 금액"}
              />
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
              <article key={account.id} className="rounded-[24px] border border-line/10 bg-paper p-5">
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
              <article key={entry.id} className="rounded-[22px] border border-amber-200 bg-amber-50/70 p-4">
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
        title={!hasCurrentMonthFlow ? "아직 시작 전" : isMonthlyComplete ? "완료" : "진행 중"}
        tone={!hasCurrentMonthFlow ? "muted" : isMonthlyComplete ? "success" : "warning"}
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
