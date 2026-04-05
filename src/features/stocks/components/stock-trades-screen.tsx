"use client";

import { useState } from "react";
import { AppShell } from "@/shared/components/layout/app-shell";
import { StockTradeBatchForm } from "@/features/stocks/components/stock-trade-batch-form";
import { StockTradesTable } from "@/features/stocks/components/stock-trades-table";
import { canManageStock } from "@/features/access/lib/access-policy";
import {
  getAccessMode,
  useAccessStore
} from "@/features/access/store/access-store";

export function StockTradesScreen() {
  const accessMode = useAccessStore(getAccessMode);
  const canManage = canManageStock(accessMode);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <AppShell
      title="통합 매매일지"
      description="여러 계좌의 보유 포지션과 매도 완료 기록을 월, 계좌, 계좌 성격, 보유 상태 조건으로 다시 읽습니다."
      actions={
        canManage ? (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            새 거래 추가
          </button>
        ) : undefined
      }
    >
      <StockTradesTable />

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/35 px-5 py-6">
          <div className="mx-auto w-full max-w-6xl">
            <div className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
                    New Trades
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">새 거래 추가</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-full border border-line/10 bg-paper px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
                >
                  닫기
                </button>
              </div>

              <div className="mt-6">
                <StockTradeBatchForm
                  inline
                  submitLabel="거래 저장"
                  onSubmitted={() => setIsCreateOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
