"use client";

import Link from "next/link";
import { canManageRoutine } from "@/features/access/lib/access-policy";
import {
  getAccessMode,
  useAccessStore
} from "@/features/access/store/access-store";

export function RoutinePageActions() {
  const accessMode = useAccessStore(getAccessMode);

  if (!canManageRoutine(accessMode)) {
    return null;
  }

  return (
    <Link
      href="/routines/new"
      className="inline-flex rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
    >
      새 루틴
    </Link>
  );
}
