"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { themes } from "@/constants/themes";
import { cn } from "@/lib/utils";
import { recordFormSchema, type RecordFormValues } from "@/schemas/record-schema";
import { useRecordStore } from "@/stores/use-record-store";
import { useTemplateStore } from "@/stores/use-template-store";

function buildAnswerFields(questions: string[]) {
  return questions.map((question) => ({
    question,
    answer: ""
  }));
}

function hasSameQuestions(
  currentAnswers: RecordFormValues["answers"],
  nextQuestions: string[]
) {
  if (currentAnswers.length !== nextQuestions.length) {
    return false;
  }

  return currentAnswers.every(
    (answer, index) => answer.question === nextQuestions[index]
  );
}

type RecordFormProps = {
  mode?: "create" | "edit";
  recordId?: string;
  initialValues?: RecordFormValues;
};

export function RecordForm({
  mode = "create",
  recordId,
  initialValues
}: RecordFormProps) {
  const router = useRouter();
  const templates = useTemplateStore((state) => state.templates);
  const addRecord = useRecordStore((state) => state.addRecord);
  const updateRecord = useRecordStore((state) => state.updateRecord);

  const initialTemplate = templates[0];
  const initialTheme = initialTemplate?.theme ?? "개발";

  const form = useForm<RecordFormValues>({
    resolver: zodResolver(recordFormSchema),
    defaultValues:
      initialValues ??
      {
        title: "",
        theme: initialTheme,
        templateId: initialTemplate?.id ?? "",
        answers: initialTemplate ? buildAnswerFields(initialTemplate.questions) : []
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

  const selectedTemplateId = useWatch({
    control: form.control,
    name: "templateId"
  });

  const filteredTemplates = useMemo(
    () => templates.filter((template) => template.theme === selectedTheme),
    [selectedTheme, templates]
  );

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId),
    [selectedTemplateId, templates]
  );

  useEffect(() => {
    if (!initialValues) {
      return;
    }

    form.reset(initialValues);
  }, [form, initialValues]);

  useEffect(() => {
    if (!filteredTemplates.length) {
      form.setValue("templateId", "");
      answers.replace([]);
      return;
    }

    const existsInTheme = filteredTemplates.some(
      (template) => template.id === selectedTemplateId
    );

    if (!existsInTheme) {
      const fallbackTemplate = filteredTemplates[0];
      form.setValue("templateId", fallbackTemplate.id, {
        shouldDirty: true,
        shouldValidate: true
      });
      if (
        !hasSameQuestions(form.getValues("answers"), fallbackTemplate.questions)
      ) {
        answers.replace(buildAnswerFields(fallbackTemplate.questions));
      }
    }
  }, [answers, filteredTemplates, form, selectedTemplateId]);

  useEffect(() => {
    if (!selectedTemplate) {
      return;
    }

    if (hasSameQuestions(form.getValues("answers"), selectedTemplate.questions)) {
      return;
    }

    answers.replace(buildAnswerFields(selectedTemplate.questions));
  }, [answers, form, selectedTemplate]);

  const onSubmit = form.handleSubmit((values) => {
    const nextRecord =
      mode === "edit" && recordId
        ? updateRecord(recordId, values)
        : addRecord(values);

    if (!nextRecord) {
      return;
    }

    router.push(`/records/${nextRecord.id}`);
  });

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-6 rounded-[28px] bg-white p-6 shadow-card md:p-8"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink/75">기록 제목</span>
          <input
            {...form.register("title")}
            placeholder="예: React Query 정리"
            className={cn(
              "h-12 rounded-2xl border border-ink/10 bg-paper px-4 text-sm outline-none transition",
              "focus:border-coral focus:bg-white"
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
              "h-12 rounded-2xl border border-ink/10 bg-paper px-4 text-sm outline-none transition",
              "focus:border-coral focus:bg-white"
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
        <span className="text-sm font-semibold text-ink/75">템플릿</span>
        <select
          {...form.register("templateId")}
          disabled={filteredTemplates.length === 0}
          className={cn(
            "h-12 rounded-2xl border border-ink/10 bg-paper px-4 text-sm outline-none transition",
            "focus:border-coral focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {filteredTemplates.length === 0 ? (
            <option value="">선택 가능한 템플릿이 없습니다.</option>
          ) : null}
          {filteredTemplates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        {form.formState.errors.templateId ? (
          <span className="text-sm text-red-600">
            {form.formState.errors.templateId.message}
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
          <div className="rounded-[24px] border border-dashed border-ink/15 bg-paper p-6 text-sm text-ink/60">
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
                className="rounded-[24px] border border-ink/10 bg-paper p-5"
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
                    "w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition",
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
          href="/records"
          className="rounded-full border border-ink/10 px-4 py-3 text-sm font-semibold text-ink/70 transition hover:border-ink/20"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={answers.fields.length === 0}
          className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mode === "edit" ? "Update record" : "Save record"}
        </button>
      </div>
    </form>
  );
}
