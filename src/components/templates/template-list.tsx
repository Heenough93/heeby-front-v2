"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useTemplateStore } from "@/stores/use-template-store";
import { themes } from "@/constants/themes";
import type { Theme } from "@/types/domain";
import { cn } from "@/lib/utils";

type ThemeFilter = Theme | "전체";
type SortOption = "latest" | "oldest" | "name";

export function TemplateList() {
  const templates = useTemplateStore((state) => state.templates);
  const removeTemplate = useTemplateStore((state) => state.removeTemplate);
  const [selectedTheme, setSelectedTheme] = useState<ThemeFilter>("전체");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  const filteredTemplates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const nextTemplates =
      selectedTheme === "전체"
        ? templates
        : templates.filter((template) => template.theme === selectedTheme);

    const searchedTemplates = normalizedSearch
      ? nextTemplates.filter((template) =>
          [template.name, template.theme, ...template.questions]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)
        )
      : nextTemplates;

    return [...searchedTemplates].sort((a, b) => {
      if (sortBy === "oldest") {
        return dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf();
      }

      if (sortBy === "name") {
        return a.name.localeCompare(b.name, "ko");
      }

      return dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf();
    });
  }, [search, selectedTheme, sortBy, templates]);

  return (
    <section className="grid gap-6">
      <div className="rounded-[28px] bg-white p-6 shadow-card">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink/75">검색</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="템플릿 이름, 주제, 질문 내용으로 검색"
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
                  ? "bg-ink text-white"
                  : "bg-paper text-ink/75 hover:bg-sand/60"
              )}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredTemplates.map((template) => (
          <article
            key={template.id}
            className="flex flex-col justify-between rounded-[28px] bg-white p-6 shadow-card"
          >
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold text-moss">
                  {template.theme}
                </span>
                <span className="text-xs text-ink/45">
                  {dayjs(template.updatedAt).format("YYYY.MM.DD")}
                </span>
              </div>
              <h2 className="text-xl font-semibold">{template.name}</h2>
              <p className="mt-2 text-sm text-ink/60">
                질문 {template.questions.length}개
              </p>
              <ul className="mt-5 space-y-2 text-sm leading-6 text-ink/75">
                {template.questions.map((question, index) => (
                  <li key={`${template.id}-${index}`}>{question}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Link
                href={`/templates/${template.id}/edit`}
                className="text-sm font-semibold text-coral"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => removeTemplate(template.id)}
                className="rounded-full border border-ink/10 px-3 py-2 text-sm font-medium text-ink/65 transition hover:border-ink/25"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-ink/15 bg-white p-10 text-center shadow-card">
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
    </section>
  );
}
