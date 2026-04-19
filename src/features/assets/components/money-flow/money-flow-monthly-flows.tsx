"use client";

import Link from "next/link";
import { getCurrentMoneyFlowMonthKey } from "@/features/assets/lib/money-flow-utils";
import { useMoneyFlowStore } from "@/features/assets/store/money-flow-store";
import { EmptyStateCard } from "@/features/assets/components/money-flow/money-flow-shared";

export function MoneyFlowMonthlyFlows() {
  const monthlyEntries = useMoneyFlowStore((state) => state.monthlyEntries);
  const groupedMonthKeys = Array.from(
    new Set(monthlyEntries.map((entry) => entry.monthKey))
  ).sort((a, b) => b.localeCompare(a));

  if (groupedMonthKeys.length === 0) {
    return (
      <EmptyStateCard
        eyebrow="월간흐름"
        title="아직 보관된 월간 흐름이 없습니다."
        description="앞으로는 매달 확정한 현금 흐름 다이어그램을 이 화면에 모아둘 예정입니다. 지금은 새 달 시작으로 생성한 월간 체크 기록을 기준으로 흐름 목록 자리를 먼저 마련합니다."
      >
        <Link
          href="/assets/money-flow"
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
          지금은 월간 체크가 시작된 달을 기준으로 보여줍니다. 다음 단계에서 윰자/히비별
          다이어그램 스냅샷을 저장하면 이 화면이 월간 흐름 아카이브가 됩니다.
        </p>
      </div>

      <div className="grid gap-3">
        {groupedMonthKeys.map((monthKey) => {
          const entries = monthlyEntries.filter((entry) => entry.monthKey === monthKey);
          const completedCount = entries.filter((entry) => entry.isChecked).length;
          const currentMonthKey = getCurrentMoneyFlowMonthKey();

          return (
            <article
              key={monthKey}
              className="flex flex-col gap-4 rounded-[28px] border border-line/10 bg-surface p-5 shadow-card md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold">{monthKey} 현금 흐름</h3>
                  {monthKey === currentMonthKey ? (
                    <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
                      이번 달
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-ink/58">
                  실행 항목 {completedCount}/{entries.length}개 완료
                </p>
              </div>

              <Link
                href="/assets/money-flow/monthly"
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
