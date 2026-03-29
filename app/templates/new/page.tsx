import { AppShell } from "@/shared/components/layout/app-shell";
import { JournalTemplateForm } from "@/features/journal-templates/components/journal-template-form";

export default function NewTemplatePage() {
  return (
    <AppShell
      title="템플릿 만들기"
      description="기록을 쉽게 시작할 수 있도록 질문 뼈대를 설계합니다. MVP 기준으로 질문은 3개에서 7개 사이가 적당합니다."
    >
      <JournalTemplateForm />
    </AppShell>
  );
}
