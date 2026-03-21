import { AppShell } from "@/components/layout/app-shell";
import { JournalForm } from "@/components/journals/journal-form";

export default function NewJournalPage() {
  return (
    <AppShell
      title="새 기록"
      description="주제를 고르고 템플릿을 선택한 뒤, 질문형 입력에 답하면서 기록을 완성합니다."
    >
      <JournalForm />
    </AppShell>
  );
}
