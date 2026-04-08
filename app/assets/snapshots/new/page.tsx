import { NewAssetSnapshotScreen } from "@/features/assets/components/snapshots/new-asset-snapshot-screen";

type NewAssetSnapshotRoutePageProps = {
  searchParams?: {
    sourceId?: string;
  };
};

export default function NewAssetSnapshotRoutePage({
  searchParams
}: NewAssetSnapshotRoutePageProps) {
  return <NewAssetSnapshotScreen sourceSnapshotId={searchParams?.sourceId} />;
}
