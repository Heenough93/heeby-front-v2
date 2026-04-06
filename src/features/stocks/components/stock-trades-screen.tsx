"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/shared/components/layout/app-shell";
import { StockTradeBatchForm } from "@/features/stocks/components/stock-trade-batch-form";
import { StockTradesTable } from "@/features/stocks/components/stock-trades-table";
import { canManageStock } from "@/features/access/lib/access-policy";
import {
  getAccessMode,
  useAccessStore
} from "@/features/access/store/access-store";
import type { StockSnapshotScope } from "@/features/stocks/lib/stock-types";

export function StockTradesScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const accessMode = useAccessStore(getAccessMode);
  const canManage = canManageStock(accessMode);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const scopeFilter = (searchParams.get("scope") === "US" ? "US" : "KR") as StockSnapshotScope;

  const setScopeFilter = (scope: StockSnapshotScope) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("scope", scope);
    router.replace(`${pathname}?${nextParams.toString()}`);
  };

  return (
    <AppShell
      title="통합 매매일지"
      actions={
        canManage ? (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            새 거래
          </button>
        ) : undefined
      }
    >
      <StockTradesTable scopeFilter={scopeFilter} onScopeChange={setScopeFilter} />

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/35 px-5 py-6">
          <div className="mx-auto w-full max-w-6xl">
            <div className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
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
                  initialScope={scopeFilter}
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
