import { NewStockSnapshotScreen } from "@/features/stocks/components/new-stock-snapshot-screen";

type NewStockSnapshotRoutePageProps = {
  searchParams?: {
    sourceId?: string;
  };
};

export default function NewStockSnapshotRoutePage({
  searchParams
}: NewStockSnapshotRoutePageProps) {
  return <NewStockSnapshotScreen sourceSnapshotId={searchParams?.sourceId} />;
}
