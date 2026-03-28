"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { JournalTemplateForm } from "@/components/journal-templates/journal-template-form";
import { useJournalTemplateStore } from "@/stores/use-journal-template-store";
import type { JournalTemplateFormValues } from "@/schemas/journal-template-schema";

type EditJournalTemplateScreenProps = {
  journalTemplateId: string;
};

function toFormValues(
  journalTemplate: ReturnType<
    typeof useJournalTemplateStore.getState
  >["journalTemplates"][number]
): JournalTemplateFormValues {
  return {
    name: journalTemplate.name,
    theme: journalTemplate.theme,
    visibility: journalTemplate.visibility,
    questions: journalTemplate.questions.map((question) => ({ value: question }))
  };
}

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
        initialValues={toFormValues(journalTemplate)}
      />
    </AppShell>
  );
}
