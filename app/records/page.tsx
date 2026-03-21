import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { RecordList } from "@/components/records/record-list";

export default function RecordsPage() {
  return (
    <AppShell
      title="Journal Records"
      description="저장한 기록을 다시 읽고, 주제별로 빠르게 탐색할 수 있는 홈 화면입니다."
      actions={
        <Link
          href="/records/new"
          className="inline-flex rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          New record
        </Link>
      }
    >
      <RecordList />
    </AppShell>
  );
}
