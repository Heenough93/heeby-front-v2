"use client";

import {
  formatMoneyFlowAmount,
  formatMoneyFlowCheckedAt,
  getCurrentMoneyFlowMonthKey,
  sortMoneyFlowMonthlyEntries
} from "@/features/assets/lib/money-flow-utils";
import { useMoneyFlowStore } from "@/features/assets/store/money-flow-store";
import {
  Field,
  MoneyFlowStartMonthEmptyState
} from "@/features/assets/components/money-flow/money-flow-shared";

export function MoneyFlowMonthly({ canManage }: { canManage: boolean }) {
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
        canManage={canManage}
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
          <article key={entry.id} className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <label className="flex items-center gap-3 text-lg font-semibold">
                  <input
                    type="checkbox"
                    checked={entry.isChecked}
                    disabled={!canManage}
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
                  disabled={!canManage}
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
                  disabled={!canManage}
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
