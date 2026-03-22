import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { JournalDetail } from "@/components/journals/journal-detail";

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
      actions={
        <Link
          href="/journals"
          className="inline-flex rounded-full border border-line/10 bg-surface px-5 py-3 text-sm font-semibold text-ink transition hover:border-coral/40 hover:bg-soft"
        >
          기록 목록으로
        </Link>
      }
    >
      <JournalDetail journalId={params.id} />
    </AppShell>
  );
}
