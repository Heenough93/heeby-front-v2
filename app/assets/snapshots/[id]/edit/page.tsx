import { EditAssetSnapshotScreen } from "@/features/assets/components/snapshots/edit-asset-snapshot-screen";

type EditAssetSnapshotRoutePageProps = {
  params: {
    id: string;
  };
};

export default function EditAssetSnapshotRoutePage({
  params
}: EditAssetSnapshotRoutePageProps) {
  return <EditAssetSnapshotScreen snapshotId={params.id} />;
}
