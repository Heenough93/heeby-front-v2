import { AppShell } from "@/shared/components/layout/app-shell";
import { JournalTemplatePageActions } from "@/features/journal-templates/components/journal-template-page-actions";
import { JournalTemplateList } from "@/features/journal-templates/components/journal-template-list";

export default function TemplatesPage() {
  return (
    <AppShell title="템플릿" actions={<JournalTemplatePageActions />}>
      <JournalTemplateList />
    </AppShell>
  );
}
