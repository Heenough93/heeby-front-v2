import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { RecordDetail } from "@/components/records/record-detail";

type RecordDetailPageProps = {
  params: {
    id: string;
  };
};

export default function RecordDetailPage({ params }: RecordDetailPageProps) {
  return (
    <AppShell
      title="Record Detail"
      description="입력은 질문형 폼이지만, 저장된 결과는 다시 읽기 좋은 문서처럼 보여야 합니다."
      actions={
        <Link
          href="/records"
          className="inline-flex rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-ink/20"
        >
          Back to records
        </Link>
      }
    >
      <RecordDetail recordId={params.id} />
    </AppShell>
  );
}
