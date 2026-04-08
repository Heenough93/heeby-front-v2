"use client";

import Link from "next/link";
import { canManageAsset } from "@/features/access/lib/access-policy";
import {
  getAccessMode,
  useAccessStore
} from "@/features/access/store/access-store";

export function AssetPageActions() {
  const accessMode = useAccessStore(getAccessMode);

  if (!canManageAsset(accessMode)) {
    return (
      <Link
        href="/assets/charts"
        className="inline-flex rounded-full border border-line/10 bg-paper px-5 py-3 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
      >
        차트
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/assets/charts"
        className="inline-flex rounded-full border border-line/10 bg-paper px-5 py-3 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
      >
        차트
      </Link>
      <Link
        href="/assets/snapshots/new"
        className="inline-flex rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
      >
        새 스냅샷
      </Link>
    </div>
  );
}
