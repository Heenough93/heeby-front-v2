import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { TemplateList } from "@/components/templates/template-list";

export default function TemplatesPage() {
  return (
    <AppShell
      title="Template Library"
      description="주제별 템플릿을 관리하고, 반복 기록에 맞는 질문 구조를 빠르게 정리합니다."
      actions={
        <Link
          href="/templates/new"
          className="inline-flex rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          New template
        </Link>
      }
    >
      <TemplateList />
    </AppShell>
  );
}
