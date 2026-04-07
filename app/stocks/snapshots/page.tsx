import { StockArchiveList } from "@/features/stocks/components/snapshots/stock-archive-list";
import { StockPageActions } from "@/features/stocks/components/stock-page-actions";
import { AppShell } from "@/shared/components/layout/app-shell";

export default function StockSnapshotsRoutePage() {
  return (
    <AppShell title="주간 시총 스냅샷" actions={<StockPageActions />}>
      <StockArchiveList />
    </AppShell>
  );
}
