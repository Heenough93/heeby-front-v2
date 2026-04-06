import { StockSnapshotDetail } from "@/features/stocks/components/stock-snapshot-detail";
import { StockSnapshotPageActions } from "@/features/stocks/components/stock-snapshot-page-actions";
import { AppShell } from "@/shared/components/layout/app-shell";

type StockSnapshotRoutePageProps = {
  params: {
    id: string;
  };
};

export default function StockSnapshotRoutePage({
  params
}: StockSnapshotRoutePageProps) {
  return (
    <AppShell title="시총 스냅샷 상세" actions={<StockSnapshotPageActions snapshotId={params.id} />}>
      <StockSnapshotDetail snapshotId={params.id} />
    </AppShell>
  );
}
