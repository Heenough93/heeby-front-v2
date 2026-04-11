"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { themes } from "@/constants/themes";
import { getVisibilityLabel } from "@/features/access/lib/access-policy";
import {
  getAccessMode,
  useAccessStore
} from "@/features/access/store/access-store";
import { useJournalStore } from "@/features/journals/store/journal-store";
import { useJournalTemplateStore } from "@/features/journal-templates/store/journal-template-store";
import { cn } from "@/lib/utils";
import type { Theme } from "@/types/domain";

type ThemeFilter = Theme | "전체";
type SortOption = "latest" | "oldest" | "title";

export function JournalList() {
  const accessMode = useAccessStore(getAccessMode);
  const getReadableJournals = useJournalStore((state) => state.getReadableJournals);
  const journalTemplates = useJournalTemplateStore(
    (state) => state.journalTemplates
  );
  const [selectedTheme, setSelectedTheme] = useState<ThemeFilter>("전체");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  const journals = useMemo(
    () => getReadableJournals(accessMode),
    [accessMode, getReadableJournals]
  );

  const filteredJournals = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const nextJournals =
      selectedTheme === "전체"
        ? journals
        : journals.filter((journal) => journal.theme === selectedTheme);

    const searchedJournals = normalizedSearch
      ? nextJournals.filter((journal) => {
          const journalTemplate = journalTemplates.find(
            (item) => item.id === journal.journalTemplateId
          );
          const content = [
            journal.title,
            journal.theme,
            journalTemplate?.name ?? journal.journalTemplateNameSnapshot ?? "",
            ...journal.answers.map((item) => `${item.question} ${item.answer}`)
          ]
            .join(" ")
            .toLowerCase();

          return content.includes(normalizedSearch);
        })
      : nextJournals;

    return [...searchedJournals].sort((a, b) => {
      if (sortBy === "oldest") {
        return dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf();
      }

      if (sortBy === "title") {
        return a.title.localeCompare(b.title, "ko");
      }

      return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
    });
  }, [journalTemplates, journals, search, selectedTheme, sortBy]);

  return (
    <section className="grid gap-6">
      <div className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink/75">검색</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="제목, 템플릿, 답변 내용으로 검색"
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
              <option value="latest">최신순</option>
              <option value="oldest">오래된순</option>
              <option value="title">제목순</option>
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

      <div className="grid gap-4">
        {filteredJournals.map((journal) => {
          const journalTemplate = journalTemplates.find(
            (item) => item.id === journal.journalTemplateId
          );
          const preview = journal.answers
            .map((item) => item.answer)
            .join(" ")
            .slice(0, 120);

          return (
            <Link
              key={journal.id}
              href={`/journals/${journal.id}`}
              className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card transition hover:-translate-y-0.5 hover:border-coral/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
                    {journal.theme}
                  </span>
                  <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-ink/68">
                    {getVisibilityLabel(journal.visibility)}
                  </span>
                  <span className="text-xs text-ink/45">
                    {dayjs(journal.createdAt).format("YYYY.MM.DD")}
                  </span>
                </div>
                <span className="text-sm text-ink/55">
                  {journalTemplate?.name ?? journal.journalTemplateNameSnapshot ?? "알 수 없는 템플릿"}
                </span>
              </div>

              <h2 className="mt-4 text-xl font-semibold">{journal.title}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/65">{preview}...</p>
            </Link>
          );
        })}
      </div>

      {filteredJournals.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-line/15 bg-surface p-10 text-center shadow-card">
          <p className="text-lg font-semibold">
            {search ? "검색 결과가 없습니다." : "아직 기록이 없습니다."}
          </p>
          <p className="mt-2 text-sm text-ink/60">
            {search
              ? "검색어를 바꾸거나 필터를 조정해보세요."
              : "템플릿을 고르고 첫 기록을 남겨보세요."}
          </p>
        </div>
      ) : null}
    </section>
  );
}
