"use client";

import Link from "next/link";
import { AppShell } from "@/shared/components/layout/app-shell";
import { toJournalTemplateFormValues } from "@/features/journal-templates/lib/journal-template-form-values";
import { useJournalTemplateStore } from "@/features/journal-templates/store/journal-template-store";
import { JournalTemplateForm } from "@/features/journal-templates/components/journal-template-form";
import { ListBackAction } from "@/shared/components/layout/list-back-action";

type EditJournalTemplateScreenProps = {
  journalTemplateId: string;
};

export function EditJournalTemplateScreen({
  journalTemplateId
}: EditJournalTemplateScreenProps) {
  const journalTemplate = useJournalTemplateStore((state) =>
    state.getJournalTemplateById(journalTemplateId)
  );

  if (!journalTemplate) {
    return (
      <AppShell title="템플릿 수정">
        <section className="rounded-[28px] border border-line/10 bg-surface p-8 shadow-card">
          <p className="text-lg font-semibold">템플릿을 찾을 수 없습니다.</p>
          <Link
            href="/templates"
            className="mt-5 inline-flex rounded-full bg-coral px-4 py-3 text-sm font-semibold text-white"
          >
            템플릿 목록으로
          </Link>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell title="템플릿 수정" actions={<ListBackAction href="/templates" />}>
      <JournalTemplateForm
        mode="edit"
        journalTemplateId={journalTemplate.id}
        initialValues={toJournalTemplateFormValues(journalTemplate)}
      />
    </AppShell>
  );
}
