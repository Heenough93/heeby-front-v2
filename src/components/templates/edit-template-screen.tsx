"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { TemplateForm } from "@/components/templates/template-form";
import { useTemplateStore } from "@/stores/use-template-store";
import type { TemplateFormValues } from "@/schemas/template-schema";

type EditTemplateScreenProps = {
  templateId: string;
};

function toFormValues(
  template: ReturnType<typeof useTemplateStore.getState>["templates"][number]
): TemplateFormValues {
  return {
    name: template.name,
    theme: template.theme,
    questions: template.questions.map((question) => ({ value: question }))
  };
}

export function EditTemplateScreen({ templateId }: EditTemplateScreenProps) {
  const template = useTemplateStore((state) => state.getTemplateById(templateId));

  if (!template) {
    return (
      <AppShell
        title="템플릿 수정"
        description="수정할 템플릿을 찾을 수 없습니다."
      >
        <section className="rounded-[28px] bg-white p-8 shadow-card">
          <p className="text-lg font-semibold">템플릿을 찾을 수 없습니다.</p>
          <Link
            href="/templates"
            className="mt-5 inline-flex rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white"
          >
            템플릿 목록으로
          </Link>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="템플릿 수정"
      description="기존 질문 구조를 수정해 템플릿을 다시 다듬습니다."
    >
      <TemplateForm
        mode="edit"
        templateId={template.id}
        initialValues={toFormValues(template)}
      />
    </AppShell>
  );
}
