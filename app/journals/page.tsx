import { AppShell } from "@/components/layout/app-shell";
import { JournalPageActions } from "@/components/journals/journal-page-actions";
import { JournalList } from "@/components/journals/journal-list";

export default function JournalsPage() {
  return (
    <AppShell
      title="기록"
      description="저장한 기록을 다시 읽고, 주제별로 빠르게 탐색할 수 있는 홈 화면입니다."
      actions={<JournalPageActions />}
    >
      <JournalList />
    </AppShell>
  );
}
