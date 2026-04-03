"use client";

import Link from "next/link";
import { canManageStock } from "@/features/access/lib/access-policy";
import {
  getAccessMode,
  useAccessStore
} from "@/features/access/store/access-store";

export function StockPageActions() {
  const accessMode = useAccessStore(getAccessMode);

  if (!canManageStock(accessMode)) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/stocks/new"
        className="inline-flex rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
      >
        새 스냅샷
      </Link>
      <Link
        href="/stocks/trades"
        className="inline-flex rounded-full border border-line/10 bg-paper px-5 py-3 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
      >
        매매일지
      </Link>
    </div>
  );
}
