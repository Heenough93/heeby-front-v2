"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/shared/components/layout/app-shell";
import { StockTradeBatchForm } from "@/features/stocks/components/stock-trade-batch-form";

export function NewStockTradesScreen() {
  const router = useRouter();

  return (
    <AppShell
      title="새 거래 추가"
      description="여러 계좌에서 발생한 매매를 한 번에 입력하고, 이후에는 필터 가능한 통합 테이블에서 다시 봅니다."
    >
      <div className="grid gap-6">
        <StockTradeBatchForm onSubmitted={() => router.push("/stocks/trades")} />
      </div>
    </AppShell>
  );
}
