import { AppShell } from "@/shared/components/layout/app-shell";
import { JournalPageActions } from "@/features/journals/components/journal-page-actions";
import { JournalList } from "@/features/journals/components/journal-list";

export default function JournalsPage() {
  return (
    <AppShell title="기록" actions={<JournalPageActions />}>
      <JournalList />
    </AppShell>
  );
}
