"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { useRecordStore } from "@/stores/use-record-store";
import { useTemplateStore } from "@/stores/use-template-store";

type RecordDetailProps = {
  recordId: string;
};

export function RecordDetail({ recordId }: RecordDetailProps) {
  const record = useRecordStore((state) => state.getRecordById(recordId));
  const templates = useTemplateStore((state) => state.templates);

  if (!record) {
    return (
      <section className="rounded-[28px] bg-white p-8 shadow-card">
        <p className="text-lg font-semibold">기록을 찾을 수 없습니다.</p>
        <p className="mt-2 text-sm text-ink/60">
          삭제되었거나 잘못된 경로일 수 있습니다.
        </p>
        <Link
          href="/records"
          className="mt-5 inline-flex rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white"
        >
          기록 목록으로
        </Link>
      </section>
    );
  }

  const template = templates.find((item) => item.id === record.templateId);

  return (
    <section className="rounded-[28px] bg-white p-8 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-5 border-b border-ink/10 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold text-moss">
              {record.theme}
            </span>
            <span className="text-sm text-ink/45">
              {dayjs(record.createdAt).format("YYYY.MM.DD HH:mm")}
            </span>
          </div>
          <h2 className="mt-4 text-3xl font-bold">{record.title}</h2>
          <p className="mt-2 text-sm text-ink/55">
            {template?.name ?? "알 수 없는 템플릿"}
          </p>
        </div>

        <Link
          href="/records/new"
          className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          New record
        </Link>
      </div>

      <div className="mt-8 grid gap-8">
        {record.answers.map((item, index) => (
          <article key={`${record.id}-${index}`} className="grid gap-3">
            <h3 className="text-lg font-semibold">{item.question}</h3>
            <p className="whitespace-pre-wrap text-sm leading-7 text-ink/75">
              {item.answer}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
