import { redirect } from "next/navigation";

type StockSnapshotRoutePageProps = {
  params: {
    id: string;
  };
};

export default function StockSnapshotRoutePage({
  params
}: StockSnapshotRoutePageProps) {
  redirect(`/stocks/snapshots/${params.id}`);
}
