import { AssetSnapshotDetail } from "@/features/assets/components/snapshots/asset-snapshot-detail";
import { AssetSnapshotPageActions } from "@/features/assets/components/snapshots/asset-snapshot-page-actions";
import { AppShell } from "@/shared/components/layout/app-shell";

type AssetSnapshotRoutePageProps = {
  params: {
    id: string;
  };
};

export default function AssetSnapshotRoutePage({
  params
}: AssetSnapshotRoutePageProps) {
  return (
    <AppShell title="자산 스냅샷 상세" actions={<AssetSnapshotPageActions snapshotId={params.id} />}>
      <AssetSnapshotDetail snapshotId={params.id} />
    </AppShell>
  );
}
