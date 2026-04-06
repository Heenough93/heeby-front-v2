import { AppShell } from "@/shared/components/layout/app-shell";
import { ListBackAction } from "@/shared/components/layout/list-back-action";
import { JournalTemplateForm } from "@/features/journal-templates/components/journal-template-form";

export default function NewTemplatePage() {
  return (
    <AppShell title="템플릿 만들기" actions={<ListBackAction href="/templates" />}>
      <JournalTemplateForm />
    </AppShell>
  );
}
