import { EditJournalScreen } from "@/features/journals/components/edit-journal-screen";

type EditJournalPageProps = {
  params: {
    id: string;
  };
};

export default function EditJournalPage({ params }: EditJournalPageProps) {
  return <EditJournalScreen journalId={params.id} />;
}
