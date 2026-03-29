import { EditJournalTemplateScreen } from "@/features/journal-templates/components/edit-journal-template-screen";

type EditTemplatePageProps = {
  params: {
    id: string;
  };
};

export default function EditTemplatePage({ params }: EditTemplatePageProps) {
  return <EditJournalTemplateScreen journalTemplateId={params.id} />;
}
