import { AppShell } from "@/shared/components/layout/app-shell";
import { JournalTemplatePageActions } from "@/features/journal-templates/components/journal-template-page-actions";
import { JournalTemplateList } from "@/features/journal-templates/components/journal-template-list";

export default function TemplatesPage() {
  return (
    <AppShell
      title="템플릿"
      description="주제별 템플릿을 관리하고, 반복 기록에 맞는 질문 구조를 빠르게 정리합니다."
      actions={<JournalTemplatePageActions />}
    >
      <JournalTemplateList />
    </AppShell>
  );
}
