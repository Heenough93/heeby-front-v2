"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { themes } from "@/constants/themes";
import { cn } from "@/lib/utils";
import { useRecordStore } from "@/stores/use-record-store";
import { useTemplateStore } from "@/stores/use-template-store";
import type { Theme } from "@/types/domain";

type ThemeFilter = Theme | "전체";
type SortOption = "latest" | "oldest" | "title";

export function RecordList() {
  const records = useRecordStore((state) => state.records);
  const templates = useTemplateStore((state) => state.templates);
  const [selectedTheme, setSelectedTheme] = useState<ThemeFilter>("전체");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  const filteredRecords = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const nextRecords =
      selectedTheme === "전체"
        ? records
        : records.filter((record) => record.theme === selectedTheme);

    const searchedRecords = normalizedSearch
      ? nextRecords.filter((record) => {
          const template = templates.find((item) => item.id === record.templateId);
          const content = [
            record.title,
            record.theme,
            template?.name ?? "",
            ...record.answers.map((item) => `${item.question} ${item.answer}`)
          ]
            .join(" ")
            .toLowerCase();

          return content.includes(normalizedSearch);
        })
      : nextRecords;

    return [...searchedRecords].sort((a, b) => {
      if (sortBy === "oldest") {
        return dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf();
      }

      if (sortBy === "title") {
        return a.title.localeCompare(b.title, "ko");
      }

      return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
    });
  }, [records, search, selectedTheme, sortBy, templates]);

  return (
    <section className="grid gap-6">
      <div className="rounded-[28px] bg-white p-6 shadow-card">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink/75">검색</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="제목, 템플릿, 답변 내용으로 검색"
              className="h-12 rounded-2xl border border-ink/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-white"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink/75">정렬</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="h-12 rounded-2xl border border-ink/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-white"
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
                  ? "bg-ink text-white"
                  : "bg-paper text-ink/75 hover:bg-sand/60"
              )}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredRecords.map((record) => {
          const template = templates.find((item) => item.id === record.templateId);
          const preview = record.answers
            .map((item) => item.answer)
            .join(" ")
            .slice(0, 120);

          return (
            <Link
              key={record.id}
              href={`/records/${record.id}`}
              className="rounded-[28px] bg-white p-6 shadow-card transition hover:-translate-y-0.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold text-moss">
                    {record.theme}
                  </span>
                  <span className="text-xs text-ink/45">
                    {dayjs(record.createdAt).format("YYYY.MM.DD")}
                  </span>
                </div>
                <span className="text-sm text-ink/55">
                  {template?.name ?? "알 수 없는 템플릿"}
                </span>
              </div>

              <h2 className="mt-4 text-xl font-semibold">{record.title}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/65">{preview}...</p>
            </Link>
          );
        })}
      </div>

      {filteredRecords.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-ink/15 bg-white p-10 text-center shadow-card">
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
