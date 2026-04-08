import { AssetArchiveList } from "@/features/assets/components/snapshots/asset-archive-list";
import { AssetPageActions } from "@/features/assets/components/asset-page-actions";
import { AppShell } from "@/shared/components/layout/app-shell";

export default function AssetSnapshotsRoutePage() {
  return (
    <AppShell title="자산 스냅샷" actions={<AssetPageActions />}>
      <AssetArchiveList />
    </AppShell>
  );
}
