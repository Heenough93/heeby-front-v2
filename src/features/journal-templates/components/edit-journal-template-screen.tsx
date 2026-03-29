"use client";

import Link from "next/link";
import { AppShell } from "@/shared/components/layout/app-shell";
import { toJournalTemplateFormValues } from "@/features/journal-templates/lib/journal-template-form-values";
import { useJournalTemplateStore } from "@/features/journal-templates/store/journal-template-store";
import { JournalTemplateForm } from "@/features/journal-templates/components/journal-template-form";

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
      <AppShell
        title="템플릿 수정"
        description="수정할 템플릿을 찾을 수 없습니다."
      >
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
    <AppShell
      title="템플릿 수정"
      description="기존 질문 구조를 수정해 템플릿을 다시 다듬습니다."
    >
      <JournalTemplateForm
        mode="edit"
        journalTemplateId={journalTemplate.id}
        initialValues={toJournalTemplateFormValues(journalTemplate)}
      />
    </AppShell>
  );
}
