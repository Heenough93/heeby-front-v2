"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { JournalForm } from "@/components/journals/journal-form";
import { useJournalStore } from "@/stores/use-journal-store";
import type { JournalFormValues } from "@/schemas/journal-schema";

type EditJournalScreenProps = {
  journalId: string;
};

function toFormValues(
  journal: ReturnType<typeof useJournalStore.getState>["journals"][number]
): JournalFormValues {
  return {
    title: journal.title,
    theme: journal.theme,
    templateId: journal.templateId,
    answers: journal.answers.map((item) => ({
      question: item.question,
      answer: item.answer
    }))
  };
}

export function EditJournalScreen({ journalId }: EditJournalScreenProps) {
  const journal = useJournalStore((state) => state.getJournalById(journalId));

  if (!journal) {
    return (
      <AppShell
        title="기록 수정"
        description="수정할 기록을 찾을 수 없습니다."
      >
        <section className="rounded-[28px] border border-line/10 bg-surface p-8 shadow-card">
          <p className="text-lg font-semibold">기록을 찾을 수 없습니다.</p>
          <Link
            href="/journals"
            className="mt-5 inline-flex rounded-full bg-coral px-4 py-3 text-sm font-semibold text-white"
          >
            기록 목록으로
          </Link>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="기록 수정"
      description="기록 제목, 템플릿 선택, 질문별 답변을 다시 수정할 수 있습니다."
    >
      <JournalForm
        mode="edit"
        journalId={journal.id}
        initialValues={toFormValues(journal)}
      />
    </AppShell>
  );
}
