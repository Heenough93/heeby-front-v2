"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useState } from "react";
import dayjs from "dayjs";
import { AlertDialog } from "@/components/feedback/alert-dialog";
import {
  canEditJournal,
  canReadContent,
  getVisibilityLabel
} from "@/lib/access-policy";
import { useJournalTemplateStore } from "@/stores/use-journal-template-store";
import { getAccessMode, useAccessStore } from "@/stores/use-access-store";
import { useJournalStore } from "@/stores/use-journal-store";
import { useToastStore } from "@/stores/use-toast-store";

type JournalDetailProps = {
  journalId: string;
};

export function JournalDetail({ journalId }: JournalDetailProps) {
  const router = useRouter();
  const accessMode = useAccessStore(getAccessMode);
  const journal = useJournalStore((state) => state.getJournalById(journalId));
  const removeJournal = useJournalStore((state) => state.removeJournal);
  const journalTemplates = useJournalTemplateStore(
    (state) => state.journalTemplates
  );
  const showToast = useToastStore((state) => state.showToast);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!journal || !canReadContent(accessMode, journal.visibility)) {
    return (
      <section className="rounded-[28px] border border-line/10 bg-surface p-8 shadow-card">
        <p className="text-lg font-semibold">기록을 찾을 수 없습니다.</p>
        <p className="mt-2 text-sm text-ink/60">
          삭제되었거나 현재 접근할 수 없는 기록일 수 있습니다.
        </p>
        <Link
          href="/journals"
          className="mt-5 inline-flex rounded-full bg-coral px-4 py-3 text-sm font-semibold text-white"
        >
          기록 목록으로
        </Link>
      </section>
    );
  }

  const journalTemplate = journalTemplates.find(
    (item) => item.id === journal.journalTemplateId
  );
  const formattedDate = dayjs(journal.createdAt).format("YYYY년 MM월 DD일 HH:mm");
  const firstAnswer = journal.answers[0]?.answer ?? "";
  const canEdit = canEditJournal(accessMode);

  return (
    <section className="overflow-hidden rounded-[32px] border border-line/10 bg-surface shadow-card">
      <div className="border-b border-line/10 bg-gradient-to-r from-soft/80 via-paper to-surface px-8 py-10 md:px-10 md:py-12">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-coral px-3 py-1 text-xs font-semibold text-white">
                {journal.theme}
              </span>
              <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-ink/70">
                {getVisibilityLabel(journal.visibility)}
              </span>
              <span className="text-sm text-ink/50">{formattedDate}</span>
            </div>
            <h2 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
              {journal.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-ink/68">
              {firstAnswer
                ? `${firstAnswer.slice(0, 120)}${firstAnswer.length > 120 ? "..." : ""}`
                : "템플릿 기반으로 작성된 기록입니다."}
            </p>
          </div>

          {canEdit ? (
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/journals/${journal.id}/edit`}
                className="rounded-full border border-line/10 bg-surface/85 px-5 py-3 text-sm font-semibold text-ink transition hover:border-coral/40 hover:bg-soft"
              >
                수정
              </Link>
              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                삭제
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-10 px-8 py-8 md:grid-cols-[minmax(0,1fr)_280px] md:px-10 md:py-10">
        <div className="grid gap-10 order-2 md:order-1">
          {journal.answers.map((item, index) => (
            <article
              key={`${journal.id}-${index}`}
              className="border-b border-line/8 pb-8 last:border-b-0 last:pb-0"
            >
              <div className="flex items-baseline gap-4">
                <span className="text-sm font-semibold tracking-[0.2em] text-coral/75">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-2xl font-semibold leading-tight">
                  {item.question}
                </h3>
              </div>
              <p className="mt-5 whitespace-pre-wrap text-[15px] leading-8 text-ink/78 md:text-base">
                {item.answer}
              </p>
            </article>
          ))}
        </div>

        <aside className="order-1 h-fit rounded-[24px] border border-line/10 bg-paper/85 p-5 md:order-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-coral">
            Archive Note
          </p>
          <dl className="mt-5 grid gap-4 text-sm">
            <div>
              <dt className="text-ink/45">주제</dt>
              <dd className="mt-1 font-semibold text-ink">{journal.theme}</dd>
            </div>
            <div>
              <dt className="text-ink/45">템플릿</dt>
              <dd className="mt-1 font-semibold text-ink">
                {journalTemplate?.name ?? "알 수 없는 템플릿"}
              </dd>
            </div>
            <div>
              <dt className="text-ink/45">질문 수</dt>
              <dd className="mt-1 font-semibold text-ink">
                {journal.answers.length}개
              </dd>
            </div>
            <div>
              <dt className="text-ink/45">작성 시각</dt>
              <dd className="mt-1 font-semibold text-ink">{formattedDate}</dd>
            </div>
          </dl>
        </aside>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        title="이 기록을 삭제할까요?"
        description="삭제 후에는 이 브라우저에서 다시 복구할 수 없습니다."
        confirmLabel="기록 삭제"
        variant="danger"
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          removeJournal(journal.id);
          showToast({
            title: "기록이 삭제되었습니다.",
            variant: "success"
          });
          setIsDeleteDialogOpen(false);
          router.push("/journals");
        }}
      />
    </section>
  );
}
