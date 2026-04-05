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
    <AppShell
      title="시총 스냅샷 상세"
      description="이번 주 순위를 저장한 시점의 판단을 읽고, 같은 시장의 바로 이전 스냅샷과의 변화를 함께 확인합니다."
      actions={<StockSnapshotPageActions snapshotId={params.id} />}
    >
      <StockSnapshotDetail snapshotId={params.id} />
    </AppShell>
  );
}
