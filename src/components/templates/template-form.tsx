"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertDialog } from "@/components/feedback/alert-dialog";
import { themes } from "@/constants/themes";
import {
  templateFormSchema,
  type TemplateFormValues
} from "@/schemas/template-schema";
import { useTemplateStore } from "@/stores/use-template-store";
import { useToastStore } from "@/stores/use-toast-store";
import { cn } from "@/lib/utils";

const defaultValues: TemplateFormValues = {
  name: "",
  theme: "개발",
  questions: [{ value: "" }, { value: "" }, { value: "" }]
};

type TemplateFormProps = {
  mode?: "create" | "edit";
  templateId?: string;
  initialValues?: TemplateFormValues;
};

export function TemplateForm({
  mode = "create",
  templateId,
  initialValues
}: TemplateFormProps) {
  const router = useRouter();
  const addTemplate = useTemplateStore((state) => state.addTemplate);
  const updateTemplate = useTemplateStore((state) => state.updateTemplate);
  const showToast = useToastStore((state) => state.showToast);
  const [pendingValues, setPendingValues] = useState<TemplateFormValues | null>(null);

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: initialValues ?? defaultValues
  });

  const questions = useFieldArray({
    control: form.control,
    name: "questions"
  });

  useEffect(() => {
    form.reset(initialValues ?? defaultValues);
  }, [form, initialValues]);

  const submitTemplate = (values: TemplateFormValues) => {
    if (mode === "edit" && templateId) {
      updateTemplate(templateId, values);
      showToast({
        title: "템플릿이 수정되었습니다.",
        variant: "success"
      });
    } else {
      addTemplate(values);
      showToast({
        title: "템플릿이 저장되었습니다.",
        variant: "success"
      });
    }
    router.push("/templates");
  };

  const onSubmit = form.handleSubmit((values) => {
    setPendingValues(values);
  });

  const canAddQuestion = questions.fields.length < 7;

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-6 rounded-[28px] border border-line/10 bg-surface p-6 shadow-card md:p-8"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink/75">
            템플릿 이름
          </span>
          <input
            {...form.register("name")}
            placeholder="예: 개발 회고 기본형"
            className={cn(
              "h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition",
              "focus:border-coral focus:bg-surface"
            )}
          />
          {form.formState.errors.name ? (
            <span className="text-sm text-red-600">
              {form.formState.errors.name.message}
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
          {form.formState.errors.theme ? (
            <span className="text-sm text-red-600">
              {form.formState.errors.theme.message}
            </span>
          ) : null}
        </label>
      </div>

      <section className="grid gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">질문 목록</h2>
            <p className="mt-1 text-sm text-ink/60">
              질문은 최소 3개, 최대 7개까지 설정할 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => questions.append({ value: "" })}
            disabled={!canAddQuestion}
            className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-35"
          >
            + 질문 추가
          </button>
        </div>

        <div className="grid gap-4">
          {questions.fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-[24px] border border-line/10 bg-paper p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink/70">
                  질문 {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => questions.remove(index)}
                  disabled={questions.fields.length <= 3}
                  className="text-sm font-medium text-ink/45 transition disabled:cursor-not-allowed disabled:opacity-35"
                >
                  삭제
                </button>
              </div>
              <input
                {...form.register(`questions.${index}.value`)}
                placeholder="질문을 입력해주세요."
                className={cn(
                  "h-12 w-full rounded-2xl border border-line/10 bg-surface px-4 text-sm outline-none transition",
                  "focus:border-coral"
                )}
              />
              {form.formState.errors.questions?.[index]?.value ? (
                <span className="mt-2 block text-sm text-red-600">
                  {form.formState.errors.questions[index]?.value?.message}
                </span>
              ) : null}
            </div>
          ))}
        </div>

        {typeof form.formState.errors.questions?.message === "string" ? (
          <p className="text-sm text-red-600">
            {form.formState.errors.questions.message}
          </p>
        ) : null}
      </section>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link
          href="/templates"
          className="rounded-full border border-line/10 bg-surface px-4 py-3 text-sm font-semibold text-ink/70 transition hover:border-coral/40 hover:bg-soft"
        >
          취소
        </Link>
        <button
          type="submit"
          className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {mode === "edit" ? "템플릿 수정" : "템플릿 저장"}
        </button>
      </div>

      <AlertDialog
        open={Boolean(pendingValues)}
        title={mode === "edit" ? "이 템플릿을 수정할까요?" : "이 템플릿을 저장할까요?"}
        description={
          mode === "edit"
            ? "질문 구조와 주제 설정이 현재 값으로 업데이트됩니다."
            : "입력한 질문 구조로 새 템플릿이 생성됩니다."
        }
        confirmLabel={mode === "edit" ? "템플릿 수정" : "템플릿 저장"}
        onClose={() => setPendingValues(null)}
        onConfirm={() => {
          if (!pendingValues) {
            return;
          }

          submitTemplate(pendingValues);
          setPendingValues(null);
        }}
      />
    </form>
  );
}
