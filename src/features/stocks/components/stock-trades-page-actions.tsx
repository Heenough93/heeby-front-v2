"use client";

import Link from "next/link";
import { canManageStock } from "@/features/access/lib/access-policy";
import {
  getAccessMode,
  useAccessStore
} from "@/features/access/store/access-store";

export function StockTradesPageActions() {
  const accessMode = useAccessStore(getAccessMode);

  if (!canManageStock(accessMode)) {
    return null;
  }

  return (
    <Link
      href="/stocks/trades/new"
      className="inline-flex rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
    >
      새 거래 추가
    </Link>
  );
}
