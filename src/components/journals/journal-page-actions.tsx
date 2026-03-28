"use client";

import Link from "next/link";
import { canEditJournal } from "@/lib/access-policy";
import { getAccessMode, useAccessStore } from "@/stores/use-access-store";

export function JournalPageActions() {
  const accessMode = useAccessStore(getAccessMode);

  if (!canEditJournal(accessMode)) {
    return null;
  }

  return (
    <Link
      href="/journals/new"
      className="inline-flex rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
    >
      새 기록
    </Link>
  );
}
