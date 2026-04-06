"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/shared/components/layout/app-shell";
import { StockTradeBatchForm } from "@/features/stocks/components/stock-trade-batch-form";

export function NewStockTradesScreen() {
  const router = useRouter();

  return (
    <AppShell title="새 거래 추가">
      <div className="grid gap-6">
        <StockTradeBatchForm onSubmitted={() => router.push("/stocks/trades")} />
      </div>
    </AppShell>
  );
}
