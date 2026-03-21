"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useTemplateStore } from "@/stores/use-template-store";
import { themes } from "@/constants/themes";
import type { Theme } from "@/types/domain";
import { cn } from "@/lib/utils";

type ThemeFilter = Theme | "전체";

export function TemplateList() {
  const templates = useTemplateStore((state) => state.templates);
  const removeTemplate = useTemplateStore((state) => state.removeTemplate);
  const [selectedTheme, setSelectedTheme] = useState<ThemeFilter>("전체");

  const filteredTemplates = useMemo(() => {
    if (selectedTheme === "전체") {
      return templates;
    }

    return templates.filter((template) => template.theme === selectedTheme);
  }, [selectedTheme, templates]);

  return (
    <section className="grid gap-6">
      <div className="rounded-[28px] bg-white p-6 shadow-card">
        <div className="flex flex-wrap gap-2">
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
                href="/templates/new"
                className="text-sm font-semibold text-coral"
              >
                Create another
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
          <p className="text-lg font-semibold">아직 템플릿이 없습니다.</p>
          <p className="mt-2 text-sm text-ink/60">
            첫 템플릿을 만들어 기록 시작 장벽을 낮춰보세요.
          </p>
        </div>
      ) : null}
    </section>
  );
}
