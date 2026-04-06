import { AppShell } from "@/shared/components/layout/app-shell";
import { ListBackAction } from "@/shared/components/layout/list-back-action";
import { JournalForm } from "@/features/journals/components/journal-form";

export default function NewJournalPage() {
  return (
    <AppShell title="새 기록" actions={<ListBackAction href="/journals" />}>
      <JournalForm />
    </AppShell>
  );
}
