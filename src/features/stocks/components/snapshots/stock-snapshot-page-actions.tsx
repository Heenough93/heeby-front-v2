"use client";

import Link from "next/link";
import { useStockStore } from "@/features/stocks/store/stock-store";

type StockSnapshotPageActionsProps = {
  snapshotId: string;
};

export function StockSnapshotPageActions({
  snapshotId
}: StockSnapshotPageActionsProps) {
  const getSnapshotById = useStockStore((state) => state.getSnapshotById);
  const snapshot = getSnapshotById(snapshotId);

  if (!snapshot) {
    return null;
  }

  return (
    <Link
      href={`/stocks/snapshots?scope=${snapshot.marketScope}`}
      className="inline-flex rounded-full border border-line/10 bg-paper px-5 py-3 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
    >
      ← 목록
    </Link>
  );
}
