"use client";

import Link from "next/link";

export function RoutinePageActions() {
  return (
    <Link
      href="/routines/new"
      className="inline-flex rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
    >
      새 루틴
    </Link>
  );
}
