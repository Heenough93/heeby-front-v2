import { StockArchiveList } from "@/features/stocks/components/stock-archive-list";
import { StockPageActions } from "@/features/stocks/components/stock-page-actions";
import { AppShell } from "@/shared/components/layout/app-shell";

export default function StocksRoutePage() {
  return (
    <AppShell
      title="주식"
      description="주간 시총 스냅샷을 쌓고, 통합 매매일지에서 여러 계좌 거래를 한 표로 다시 읽습니다."
      actions={<StockPageActions />}
    >
      <StockArchiveList />
    </AppShell>
  );
}
