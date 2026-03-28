"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { AlertDialog } from "@/components/feedback/alert-dialog";
import { getVisibilityLabel } from "@/lib/access-policy";
import { useJournalTemplateStore } from "@/stores/use-journal-template-store";
import { useToastStore } from "@/stores/use-toast-store";
import { themes } from "@/constants/themes";
import type { Theme } from "@/types/domain";
import { cn } from "@/lib/utils";

type ThemeFilter = Theme | "전체";
type SortOption = "latest" | "oldest" | "name";

export function JournalTemplateList() {
  const journalTemplates = useJournalTemplateStore(
    (state) => state.journalTemplates
  );
  const removeJournalTemplate = useJournalTemplateStore(
    (state) => state.removeJournalTemplate
  );
  const showToast = useToastStore((state) => state.showToast);
  const [selectedTheme, setSelectedTheme] = useState<ThemeFilter>("전체");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [pendingDeleteJournalTemplateId, setPendingDeleteJournalTemplateId] =
    useState<string | null>(null);

  const filteredJournalTemplates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const nextJournalTemplates =
      selectedTheme === "전체"
        ? journalTemplates
        : journalTemplates.filter(
            (journalTemplate) => journalTemplate.theme === selectedTheme
          );

    const searchedJournalTemplates = normalizedSearch
      ? nextJournalTemplates.filter((journalTemplate) =>
          [
            journalTemplate.name,
            journalTemplate.theme,
            ...journalTemplate.questions
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)
        )
      : nextJournalTemplates;

    return [...searchedJournalTemplates].sort((a, b) => {
      if (sortBy === "oldest") {
        return dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf();
      }

      if (sortBy === "name") {
        return a.name.localeCompare(b.name, "ko");
      }

      return dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf();
    });
  }, [journalTemplates, search, selectedTheme, sortBy]);

  const pendingDeleteJournalTemplate = journalTemplates.find(
    (journalTemplate) => journalTemplate.id === pendingDeleteJournalTemplateId
  );

  return (
    <section className="grid gap-6">
      <div className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink/75">검색</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="템플릿 이름, 주제, 질문 내용으로 검색"
              className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-surface"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink/75">정렬</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-surface"
            >
              <option value="latest">최근 수정순</option>
              <option value="oldest">오래된순</option>
              <option value="name">이름순</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["전체", ...themes] as ThemeFilter[]).map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => setSelectedTheme(theme)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                selectedTheme === theme
                  ? "bg-coral text-white"
                  : "bg-paper text-ink/75 hover:bg-soft"
              )}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredJournalTemplates.map((journalTemplate) => (
          <article
            key={journalTemplate.id}
            className="flex flex-col justify-between rounded-[28px] border border-line/10 bg-surface p-6 shadow-card"
          >
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
                    {journalTemplate.theme}
                  </span>
                  <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-ink/70">
                    {getVisibilityLabel(journalTemplate.visibility)}
                  </span>
                </div>
                <span className="text-xs text-ink/45">
                  {dayjs(journalTemplate.updatedAt).format("YYYY.MM.DD")}
                </span>
              </div>
              <h2 className="text-xl font-semibold">{journalTemplate.name}</h2>
              <p className="mt-2 text-sm text-ink/60">
                질문 {journalTemplate.questions.length}개
              </p>
              <ul className="mt-5 space-y-2 text-sm leading-6 text-ink/75">
                {journalTemplate.questions.map((question, index) => (
                  <li key={`${journalTemplate.id}-${index}`}>{question}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Link
                href={`/templates/${journalTemplate.id}/edit`}
                className="text-sm font-semibold text-coral"
              >
                수정
              </Link>
              <button
                type="button"
                onClick={() =>
                  setPendingDeleteJournalTemplateId(journalTemplate.id)
                }
                className="rounded-full border border-line/10 bg-surface px-3 py-2 text-sm font-medium text-ink/65 transition hover:border-coral/40 hover:bg-soft"
              >
                삭제
              </button>
            </div>
          </article>
        ))}
      </div>

      {filteredJournalTemplates.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-line/15 bg-surface p-10 text-center shadow-card">
          <p className="text-lg font-semibold">
            {search ? "검색 결과가 없습니다." : "아직 템플릿이 없습니다."}
          </p>
          <p className="mt-2 text-sm text-ink/60">
            {search
              ? "검색어를 바꾸거나 필터를 조정해보세요."
              : "첫 템플릿을 만들어 기록 시작 장벽을 낮춰보세요."}
          </p>
        </div>
      ) : null}

      <AlertDialog
        open={Boolean(pendingDeleteJournalTemplate)}
        title="이 템플릿을 삭제할까요?"
        description="삭제하면 이 브라우저에 저장된 템플릿 목록에서 제거됩니다."
        confirmLabel="템플릿 삭제"
        variant="danger"
        onClose={() => setPendingDeleteJournalTemplateId(null)}
        onConfirm={() => {
          if (!pendingDeleteJournalTemplate) {
            return;
          }

          removeJournalTemplate(pendingDeleteJournalTemplate.id);
          showToast({
            title: "템플릿이 삭제되었습니다.",
            variant: "success"
          });
          setPendingDeleteJournalTemplateId(null);
        }}
      />
    </section>
  );
}
