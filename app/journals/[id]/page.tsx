import Link from "next/link";
import { AppShell } from "@/shared/components/layout/app-shell";
import { JournalDetail } from "@/features/journals/components/journal-detail";
import { ListBackAction } from "@/shared/components/layout/list-back-action";

type JournalDetailPageProps = {
  params: {
    id: string;
  };
};

export default function JournalDetailPage({ params }: JournalDetailPageProps) {
  return (
    <AppShell
      title="기록 상세"
      description="입력은 질문형 폼이지만, 저장된 결과는 다시 읽기 좋은 문서처럼 보여야 합니다."
      actions={<ListBackAction href="/journals" />}
    >
      <JournalDetail journalId={params.id} />
    </AppShell>
  );
}
