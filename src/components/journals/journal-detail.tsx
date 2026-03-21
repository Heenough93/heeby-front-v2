"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useJournalStore } from "@/stores/use-journal-store";
import { useTemplateStore } from "@/stores/use-template-store";

type JournalDetailProps = {
  journalId: string;
};

export function JournalDetail({ journalId }: JournalDetailProps) {
  const router = useRouter();
  const journal = useJournalStore((state) => state.getJournalById(journalId));
  const removeJournal = useJournalStore((state) => state.removeJournal);
  const templates = useTemplateStore((state) => state.templates);

  if (!journal) {
    return (
      <section className="rounded-[28px] bg-white p-8 shadow-card">
        <p className="text-lg font-semibold">기록을 찾을 수 없습니다.</p>
        <p className="mt-2 text-sm text-ink/60">
          삭제되었거나 잘못된 경로일 수 있습니다.
        </p>
        <Link
          href="/journals"
          className="mt-5 inline-flex rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white"
        >
          기록 목록으로
        </Link>
      </section>
    );
  }

  const template = templates.find((item) => item.id === journal.templateId);

  return (
    <section className="rounded-[28px] bg-white p-8 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-5 border-b border-ink/10 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold text-moss">
              {journal.theme}
            </span>
            <span className="text-sm text-ink/45">
              {dayjs(journal.createdAt).format("YYYY.MM.DD HH:mm")}
            </span>
          </div>
          <h2 className="mt-4 text-3xl font-bold">{journal.title}</h2>
          <p className="mt-2 text-sm text-ink/55">
            {template?.name ?? "알 수 없는 템플릿"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/journals/${journal.id}/edit`}
            className="rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-ink/20"
          >
            수정
          </Link>
          <button
            type="button"
            onClick={() => {
              removeJournal(journal.id);
              router.push("/journals");
            }}
            className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            삭제
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-8">
        {journal.answers.map((item, index) => (
          <article key={`${journal.id}-${index}`} className="grid gap-3">
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
