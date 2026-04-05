import { StockArchiveList } from "@/features/stocks/components/stock-archive-list";
import { StockPageActions } from "@/features/stocks/components/stock-page-actions";
import { AppShell } from "@/shared/components/layout/app-shell";

export default function StockSnapshotsRoutePage() {
  return (
    <AppShell
      title="주간 시총 스냅샷"
      description="한국시장과 미국시장을 나눠서 주간 시총 순위 관찰 기록을 저장하고, 전주 대비 변화를 다시 읽습니다."
      actions={<StockPageActions />}
    >
      <StockArchiveList />
    </AppShell>
  );
}
