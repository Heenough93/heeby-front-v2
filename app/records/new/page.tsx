import { AppShell } from "@/components/layout/app-shell";
import { RecordForm } from "@/components/records/record-form";

export default function NewRecordPage() {
  return (
    <AppShell
      title="New Record"
      description="주제를 고르고 템플릿을 선택한 뒤, 질문형 입력에 답하면서 기록을 완성합니다."
    >
      <RecordForm />
    </AppShell>
  );
}
