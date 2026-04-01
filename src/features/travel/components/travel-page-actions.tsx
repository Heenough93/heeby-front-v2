"use client";

import Link from "next/link";
import { canManageTravel } from "@/features/access/lib/access-policy";
import {
  getAccessMode,
  useAccessStore
} from "@/features/access/store/access-store";

export function TravelPageActions() {
  const accessMode = useAccessStore(getAccessMode);

  if (!canManageTravel(accessMode)) {
    return null;
  }

  return (
    <Link
      href="/travel/new"
      className="inline-flex rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
    >
      새 여행
    </Link>
  );
}
