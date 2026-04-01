"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertDialog } from "@/shared/components/feedback/alert-dialog";
import { useJournalStore } from "@/features/journals/store/journal-store";
import { useJournalTemplateStore } from "@/features/journal-templates/store/journal-template-store";
import {
  journalFormSchema,
  type JournalFormValues
} from "@/features/journals/lib/journal-form-schema";
import { themes } from "@/constants/themes";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/stores/ui/use-toast-store";

function buildAnswerFields(questions: string[]) {
  return questions.map((question) => ({
    question,
    answer: ""
  }));
}

function hasSameQuestions(
  currentAnswers: JournalFormValues["answers"],
  nextQuestions: string[]
) {
  if (currentAnswers.length !== nextQuestions.length) {
    return false;
  }

  return currentAnswers.every(
    (answer, index) => answer.question === nextQuestions[index]
  );
}

type JournalFormProps = {
  mode?: "create" | "edit";
  journalId?: string;
  initialValues?: JournalFormValues;
};

export function JournalForm({
  mode = "create",
  journalId,
  initialValues
}: JournalFormProps) {
  const router = useRouter();
  const journalTemplates = useJournalTemplateStore((state) => state.journalTemplates);
  const getJournalTemplatesByTheme = useJournalTemplateStore(
    (state) => state.getJournalTemplatesByTheme
  );
  const getRecentJournalTemplates = useJournalTemplateStore(
    (state) => state.getRecentJournalTemplates
  );
  const markJournalTemplateAsRecent = useJournalTemplateStore(
    (state) => state.markJournalTemplateAsRecent
  );
  const addJournal = useJournalStore((state) => state.addJournal);
  const updateJournal = useJournalStore((state) => state.updateJournal);
  const showToast = useToastStore((state) => state.showToast);
  const [pendingValues, setPendingValues] = useState<JournalFormValues | null>(null);

  const initialJournalTemplate = journalTemplates[0];
  const initialTheme = initialJournalTemplate?.theme ?? "개발";

  const form = useForm<JournalFormValues>({
    resolver: zodResolver(journalFormSchema),
    defaultValues:
      initialValues ??
      {
        title: "",
        theme: initialTheme,
        journalTemplateId: initialJournalTemplate?.id ?? "",
        visibility: "private",
        answers: initialJournalTemplate
          ? buildAnswerFields(initialJournalTemplate.questions)
          : []
      }
  });

  const answers = useFieldArray({
    control: form.control,
    name: "answers"
  });

  const selectedTheme = useWatch({
    control: form.control,
    name: "theme"
  });

  const selectedJournalTemplateId = useWatch({
    control: form.control,
    name: "journalTemplateId"
  });

  const filteredJournalTemplates = useMemo(
    () => getJournalTemplatesByTheme(selectedTheme),
    [getJournalTemplatesByTheme, selectedTheme]
  );

  const recentJournalTemplates = useMemo(
    () => getRecentJournalTemplates(),
    [getRecentJournalTemplates]
  );

  const selectedJournalTemplate = useMemo(
    () =>
      journalTemplates.find(
        (journalTemplate) => journalTemplate.id === selectedJournalTemplateId
      ),
    [journalTemplates, selectedJournalTemplateId]
  );

  const applyJournalTemplate = (journalTemplateId: string) => {
    const journalTemplate = journalTemplates.find(
      (item) => item.id === journalTemplateId
    );

    if (!journalTemplate) {
      return;
    }

    form.setValue("theme", journalTemplate.theme, {
      shouldDirty: true,
      shouldValidate: true
    });
    form.setValue("journalTemplateId", journalTemplate.id, {
      shouldDirty: true,
      shouldValidate: true
    });
    answers.replace(buildAnswerFields(journalTemplate.questions));
  };

  useEffect(() => {
    if (!initialValues) {
      return;
    }

    form.reset(initialValues);
  }, [form, initialValues]);

  useEffect(() => {
    if (!filteredJournalTemplates.length) {
      form.setValue("journalTemplateId", "");
      answers.replace([]);
      return;
    }

    const existsInTheme = filteredJournalTemplates.some(
      (journalTemplate) => journalTemplate.id === selectedJournalTemplateId
    );

    if (!existsInTheme) {
      const fallbackJournalTemplate = filteredJournalTemplates[0];
      form.setValue("journalTemplateId", fallbackJournalTemplate.id, {
        shouldDirty: true,
        shouldValidate: true
      });
      if (
        !hasSameQuestions(
          form.getValues("answers"),
          fallbackJournalTemplate.questions
        )
      ) {
        answers.replace(buildAnswerFields(fallbackJournalTemplate.questions));
      }
    }
  }, [answers, filteredJournalTemplates, form, selectedJournalTemplateId]);

  useEffect(() => {
    if (!selectedJournalTemplate) {
      return;
    }

    if (
      hasSameQuestions(form.getValues("answers"), selectedJournalTemplate.questions)
    ) {
      return;
    }

    answers.replace(buildAnswerFields(selectedJournalTemplate.questions));
  }, [answers, form, selectedJournalTemplate]);

  const submitJournal = (values: JournalFormValues) => {
    const nextJournal =
      mode === "edit" && journalId
        ? updateJournal(journalId, values)
        : addJournal(values);

    if (!nextJournal) {
      return;
    }

    markJournalTemplateAsRecent(values.journalTemplateId);
    showToast({
      title: mode === "edit" ? "기록이 수정되었습니다." : "기록이 저장되었습니다.",
      variant: "success"
    });
    router.push(`/journals/${nextJournal.id}`);
  };

  const onSubmit = form.handleSubmit((values) => {
    setPendingValues(values);
  });

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-6 rounded-[28px] border border-line/10 bg-surface p-6 shadow-card md:p-8"
    >
      {mode === "create" && recentJournalTemplates.length > 0 ? (
        <section className="grid gap-3 rounded-[24px] border border-line/10 bg-paper p-5">
          <div>
            <h2 className="text-lg font-semibold">최근 사용 템플릿</h2>
            <p className="mt-1 text-sm text-ink/60">
              최근에 쓴 템플릿으로 바로 시작할 수 있습니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {recentJournalTemplates.map((journalTemplate) => (
              <button
                key={journalTemplate.id}
                type="button"
                onClick={() => applyJournalTemplate(journalTemplate.id)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left transition",
                  selectedJournalTemplateId === journalTemplate.id
                    ? "border-coral bg-surface"
                    : "border-line/10 bg-surface hover:border-coral/40 hover:bg-soft"
                )}
              >
                <p className="text-sm font-semibold">{journalTemplate.name}</p>
                <p className="mt-1 text-xs text-ink/55">{journalTemplate.theme}</p>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink/75">기록 제목</span>
          <input
            {...form.register("title")}
            placeholder="예: React Query 정리"
            className={cn(
              "h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition",
              "focus:border-coral focus:bg-surface"
            )}
          />
          {form.formState.errors.title ? (
            <span className="text-sm text-red-600">
              {form.formState.errors.title.message}
            </span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink/75">주제</span>
          <select
            {...form.register("theme")}
            className={cn(
              "h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition",
              "focus:border-coral focus:bg-surface"
            )}
          >
            {themes.map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-ink/75">공개 범위</span>
        <select
          {...form.register("visibility")}
          className={cn(
            "h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition",
            "focus:border-coral focus:bg-surface"
          )}
        >
          <option value="private">비공개</option>
          <option value="public">공개</option>
        </select>
        <p className="text-sm text-ink/60">
          공개 기록은 로그인하지 않은 방문자에게 전체 내용이 그대로 보입니다.
        </p>
        {form.formState.errors.visibility ? (
          <span className="text-sm text-red-600">
            {form.formState.errors.visibility.message}
          </span>
        ) : null}
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-ink/75">템플릿</span>
        <select
          {...form.register("journalTemplateId")}
          disabled={filteredJournalTemplates.length === 0}
          className={cn(
            "h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition",
            "focus:border-coral focus:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {filteredJournalTemplates.length === 0 ? (
            <option value="">선택 가능한 템플릿이 없습니다.</option>
          ) : null}
          {filteredJournalTemplates.map((journalTemplate) => (
            <option key={journalTemplate.id} value={journalTemplate.id}>
              {journalTemplate.name}
            </option>
          ))}
        </select>
        {form.formState.errors.journalTemplateId ? (
          <span className="text-sm text-red-600">
            {form.formState.errors.journalTemplateId.message}
          </span>
        ) : null}
      </label>

      <section className="grid gap-4">
        <div>
          <h2 className="text-lg font-semibold">질문형 입력</h2>
          <p className="mt-1 text-sm text-ink/60">
            빈 화면 대신 템플릿 질문에 답하는 방식으로 기록을 작성합니다.
          </p>
        </div>

        {answers.fields.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-line/15 bg-paper p-6 text-sm text-ink/60">
            먼저 선택한 주제에 맞는 템플릿을 만들어야 합니다.
            <Link href="/templates/new" className="ml-2 font-semibold text-coral">
              템플릿 만들기
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {answers.fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-[24px] border border-line/10 bg-paper p-5"
              >
                <p className="mb-3 text-sm font-semibold text-ink/75">
                  {field.question}
                </p>
                <input type="hidden" {...form.register(`answers.${index}.question`)} />
                <textarea
                  {...form.register(`answers.${index}.answer`)}
                  rows={5}
                  placeholder="답변을 입력해주세요."
                  className={cn(
                    "w-full rounded-2xl border border-line/10 bg-surface px-4 py-3 text-sm outline-none transition",
                    "focus:border-coral"
                  )}
                />
                {form.formState.errors.answers?.[index]?.answer ? (
                  <span className="mt-2 block text-sm text-red-600">
                    {form.formState.errors.answers[index]?.answer?.message}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link
          href="/journals"
          className="rounded-full border border-line/10 bg-surface px-4 py-3 text-sm font-semibold text-ink/70 transition hover:border-coral/40 hover:bg-soft"
        >
          취소
        </Link>
        <button
          type="submit"
          disabled={answers.fields.length === 0}
          className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mode === "edit" ? "기록 수정" : "기록 저장"}
        </button>
      </div>

      <AlertDialog
        open={Boolean(pendingValues)}
        title={mode === "edit" ? "이 기록을 수정할까요?" : "이 기록을 저장할까요?"}
        description={
          mode === "edit"
            ? "현재 입력한 제목과 답변으로 기록이 업데이트됩니다."
            : "현재 입력한 답변으로 새 기록이 저장됩니다."
        }
        confirmLabel={mode === "edit" ? "기록 수정" : "기록 저장"}
        onClose={() => setPendingValues(null)}
        onConfirm={() => {
          if (!pendingValues) {
            return;
          }

          submitJournal(pendingValues);
          setPendingValues(null);
        }}
      />
    </form>
  );
}
