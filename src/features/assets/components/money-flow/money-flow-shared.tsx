"use client";

import { useMoneyFlowStore } from "@/features/assets/store/money-flow-store";

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

export function MoneyFlowStartMonthEmptyState({
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
