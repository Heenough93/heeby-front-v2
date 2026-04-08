"use client";

import Link from "next/link";

type AssetSnapshotPageActionsProps = {
  snapshotId: string;
};

export function AssetSnapshotPageActions({
  snapshotId: _snapshotId
}: AssetSnapshotPageActionsProps) {
  return (
    <Link
      href="/assets/snapshots"
      className="inline-flex rounded-full border border-line/10 bg-paper px-5 py-3 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
    >
      ← 목록
    </Link>
  );
}
