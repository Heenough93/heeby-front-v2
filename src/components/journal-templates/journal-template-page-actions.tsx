"use client";

import Link from "next/link";
import { canManageJournalTemplate } from "@/lib/access-policy";
import { getAccessMode, useAccessStore } from "@/stores/use-access-store";

export function JournalTemplatePageActions() {
  const accessMode = useAccessStore(getAccessMode);

  if (!canManageJournalTemplate(accessMode)) {
    return null;
  }

  return (
    <Link
      href="/templates/new"
      className="inline-flex rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
    >
      새 템플릿
    </Link>
  );
}
