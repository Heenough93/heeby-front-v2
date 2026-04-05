import type { StockSnapshotScope } from "@/features/stocks/lib/stock-types";
import { NewStockSnapshotScreen } from "@/features/stocks/components/new-stock-snapshot-screen";

type NewStockSnapshotRoutePageProps = {
  searchParams?: {
    sourceId?: string;
    scope?: string;
  };
};

export default function NewStockSnapshotRoutePage({
  searchParams
}: NewStockSnapshotRoutePageProps) {
  const initialScope = searchParams?.scope === "US" ? "US" : "KR";

  return (
    <NewStockSnapshotScreen
      sourceSnapshotId={searchParams?.sourceId}
      initialScope={initialScope as StockSnapshotScope}
    />
  );
}
