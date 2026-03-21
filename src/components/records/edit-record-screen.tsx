"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { RecordForm } from "@/components/records/record-form";
import { useRecordStore } from "@/stores/use-record-store";
import type { RecordFormValues } from "@/schemas/record-schema";

type EditRecordScreenProps = {
  recordId: string;
};

function toFormValues(
  record: ReturnType<typeof useRecordStore.getState>["records"][number]
): RecordFormValues {
  return {
    title: record.title,
    theme: record.theme,
    templateId: record.templateId,
    answers: record.answers.map((item) => ({
      question: item.question,
      answer: item.answer
    }))
  };
}

export function EditRecordScreen({ recordId }: EditRecordScreenProps) {
  const record = useRecordStore((state) => state.getRecordById(recordId));

  if (!record) {
    return (
      <AppShell
        title="Edit Record"
        description="수정할 기록을 찾을 수 없습니다."
      >
        <section className="rounded-[28px] bg-white p-8 shadow-card">
          <p className="text-lg font-semibold">기록을 찾을 수 없습니다.</p>
          <Link
            href="/records"
            className="mt-5 inline-flex rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white"
          >
            기록 목록으로
          </Link>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Edit Record"
      description="기록 제목, 템플릿 선택, 질문별 답변을 다시 수정할 수 있습니다."
    >
      <RecordForm
        mode="edit"
        recordId={record.id}
        initialValues={toFormValues(record)}
      />
    </AppShell>
  );
}
