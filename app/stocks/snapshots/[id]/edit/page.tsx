import { EditStockSnapshotScreen } from "@/features/stocks/components/edit-stock-snapshot-screen";

type EditStockSnapshotRoutePageProps = {
  params: {
    id: string;
  };
};

export default function EditStockSnapshotRoutePage({
  params
}: EditStockSnapshotRoutePageProps) {
  return <EditStockSnapshotScreen snapshotId={params.id} />;
}
