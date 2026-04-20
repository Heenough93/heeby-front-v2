"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";
import {
  formatMoneyFlowAmount,
  getMoneyFlowStartMonthPreview
} from "@/features/assets/lib/money-flow-utils";
import { useMoneyFlowStore } from "@/features/assets/store/money-flow-store";
import { getOwnerScopeLabel, ownerScopeValues, type OwnerScope } from "@/types/domain";

export function getMoneyFlowHref(href: string, ownerScope: OwnerScope) {
  return `${href}?owner=${ownerScope}`;
}

export function useMoneyFlowOwnerScope(): OwnerScope {
  const searchParams = useSearchParams();
  const owner = searchParams.get("owner");

  return ownerScopeValues.includes(owner as OwnerScope) ? (owner as OwnerScope) : "yumja";
}

export function MoneyFlowOwnerSwitcher({ ownerScope }: { ownerScope: OwnerScope }) {
  const pathname = usePathname();

  return (
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-line/10 bg-surface p-4 shadow-card">
      <div>
        <p className="text-sm font-semibold text-coral">관리 대상</p>
        <p className="mt-1 text-sm text-ink/62">
          현금 흐름은 윰자와 히비를 분리해서 관리합니다.
        </p>
      </div>
      <div className="flex rounded-full border border-line/10 bg-paper p-1">
        {ownerScopeValues.map((scope) => (
          <Link
            key={scope}
            href={getMoneyFlowHref(pathname, scope)}
            className={
              ownerScope === scope
                ? "rounded-full bg-coral px-5 py-2 text-sm font-semibold text-white"
                : "rounded-full px-5 py-2 text-sm font-semibold text-ink/62 transition hover:bg-soft"
            }
          >
            {getOwnerScopeLabel(scope)}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
      <p className="text-sm font-semibold text-ink/58">{label}</p>
      <p className="mt-3 text-2xl font-bold">{value}</p>
    </article>
  );
}

export function FlowNode({
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

export function EditorCard({
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

export function Field({
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

export function EmptyStateCard({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-dashed border-line/15 bg-surface p-8 text-center shadow-card">
      {eyebrow ? <p className="text-sm font-semibold text-coral">{eyebrow}</p> : null}
      <h2 className={eyebrow ? "mt-3 text-2xl font-bold" : "text-2xl font-bold"}>{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-ink/62">{description}</p>
      {children ? <div className="mt-6 flex flex-wrap justify-center gap-2">{children}</div> : null}
    </section>
  );
}

export function InlineNotice({
  tone = "warning",
  children
}: {
  tone?: "warning" | "muted";
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        tone === "warning"
          ? "mb-4 rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800"
          : "mb-4 rounded-[22px] border border-line/10 bg-paper px-4 py-3 text-sm leading-6 text-ink/64"
      }
    >
      {children}
    </div>
  );
}

export function MoneyFlowStartMonthEmptyState({
  ownerScope,
  monthKey,
  title = "이번 달 현금 흐름이 아직 시작되지 않았습니다.",
  description = "새 달 시작 버튼을 눌러 현재 배분 규칙 기준으로 이번 달 다이어그램을 생성하세요.",
  actionLabel,
  onStart,
  canManage = true
}: {
  ownerScope: OwnerScope;
  monthKey: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  onStart?: () => void;
  canManage?: boolean;
}) {
  const startMonthlyFlow = useMoneyFlowStore((state) => state.startMonthlyFlow);
  const accounts = useMoneyFlowStore((state) => state.accounts);
  const rules = useMoneyFlowStore((state) => state.rules);
  const scopedAccounts = accounts.filter((account) => account.ownerScope === ownerScope);
  const scopedRules = rules.filter((rule) => rule.ownerScope === ownerScope);
  const preview = getMoneyFlowStartMonthPreview({ accounts: scopedAccounts, rules: scopedRules });

  return (
    <section className="rounded-[28px] border border-dashed border-line/15 bg-surface p-6 shadow-card md:p-10">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold text-coral">{monthKey}</p>
        <h2 className="mt-3 text-2xl font-bold">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-ink/62">{description}</p>
      </div>

      <div className="mt-7 grid gap-3 md:grid-cols-4">
        <StartMonthPreviewCard
          label="기준 급여"
          value={formatMoneyFlowAmount(preview.salaryAmount)}
          description="활성 급여 계좌 잔액 합계"
        />
        <StartMonthPreviewCard
          label="생성 항목"
          value={`${preview.expectedEntryCount}개`}
          description="활성 규칙에서 생성될 transfer"
        />
        <StartMonthPreviewCard
          label="고정 배분"
          value={formatMoneyFlowAmount(preview.fixedTotalAmount)}
          description={`${preview.activeRuleCount}개 활성 규칙 기준`}
        />
        <StartMonthPreviewCard
          label="잔여 규칙"
          value={preview.hasRemainderRule ? "포함" : "없음"}
          description="남은 돈을 여윳돈으로 보내는 규칙"
        />
      </div>

      <div className="mt-6 rounded-[22px] border border-line/10 bg-paper px-5 py-4 text-sm leading-6 text-ink/64">
        {canManage
          ? "버튼을 누르면 현재 배분 규칙 기준으로 이번 달 현금 흐름 다이어그램과 transfer가 생성됩니다. 금액은 생성 후 월간 체크 화면에서 실제 금액으로 수정할 수 있습니다."
          : "현재 권한에서는 이번 달 현금 흐름 다이어그램을 생성할 수 없습니다."}
        {preview.activeRuleCount === 0 ? (
          <span className="mt-2 block font-semibold text-amber-700">
            활성 배분 규칙이 없습니다. 빈 다이어그램만 생성됩니다.
          </span>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link
          href={getMoneyFlowHref("/assets/money-flow/rules", ownerScope)}
          className="rounded-full border border-line/10 bg-paper px-5 py-3 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
        >
          배분 규칙 확인
        </Link>
        {canManage ? (
          <button
            type="button"
            onClick={() => {
              if (onStart) {
                onStart();
                return;
              }

              startMonthlyFlow(ownerScope, monthKey);
            }}
            className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {actionLabel ?? `${monthKey} 새 달 시작`}
          </button>
        ) : null}
      </div>
    </section>
  );
}

function StartMonthPreviewCard({
  label,
  value,
  description
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <article className="rounded-[22px] border border-line/10 bg-paper p-4">
      <p className="text-xs font-semibold text-ink/52">{label}</p>
      <p className="mt-2 text-xl font-bold">{value}</p>
      <p className="mt-1 text-xs leading-5 text-ink/52">{description}</p>
    </article>
  );
}

export function getStatusBadgeClassName(status: "healthy" | "warning" | "inactive") {
  switch (status) {
    case "healthy":
      return "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700";
    case "warning":
      return "rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700";
    case "inactive":
      return "rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/52";
  }
}
