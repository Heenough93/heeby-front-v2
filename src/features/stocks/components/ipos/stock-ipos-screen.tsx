"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/shared/components/layout/app-shell";
import { canManageStock } from "@/features/access/lib/access-policy";
import { getAccessMode, useAccessStore } from "@/features/access/store/access-store";
import { StockIpoForm } from "@/features/stocks/components/ipos/stock-ipo-form";
import { StockIposTable } from "@/features/stocks/components/ipos/stock-ipos-table";
import type { OwnerScope } from "@/types/domain";

export function StockIposScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const accessMode = useAccessStore(getAccessMode);
  const canManage = canManageStock(accessMode);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const scopeFilter = (searchParams.get("scope") === "yumja"
    ? "yumja"
    : searchParams.get("scope") === "heeby"
      ? "heeby"
      : "all") as OwnerScope | "all";

  const setScopeFilter = (scope: OwnerScope | "all") => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("scope", scope);
    router.replace(`${pathname}?${nextParams.toString()}`);
  };

  return (
    <AppShell
      title="공모주 청약 및 매도"
      actions={
        canManage ? (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            새 공모주
          </button>
        ) : undefined
      }
    >
      <StockIposTable
        scopeFilter={scopeFilter}
        onScopeChange={setScopeFilter}
        canManage={canManage}
      />

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/35 px-5 py-6">
          <div className="mx-auto w-full max-w-6xl">
            <div className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold">새 공모주</h2>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-full border border-line/10 bg-paper px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
                >
                  닫기
                </button>
              </div>

              <div className="mt-6">
                <StockIpoForm
                  inline
                  submitLabel="공모주 저장"
                  initialOwnerScope={scopeFilter === "all" ? "yumja" : scopeFilter}
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
