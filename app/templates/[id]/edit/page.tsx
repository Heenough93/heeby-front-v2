import { EditJournalTemplateScreen } from "@/components/journal-templates/edit-journal-template-screen";

type EditTemplatePageProps = {
  params: {
    id: string;
  };
};

export default function EditTemplatePage({ params }: EditTemplatePageProps) {
  return <EditJournalTemplateScreen journalTemplateId={params.id} />;
}
