import { EditRecordScreen } from "@/components/records/edit-record-screen";

type EditRecordPageProps = {
  params: {
    id: string;
  };
};

export default function EditRecordPage({ params }: EditRecordPageProps) {
  return <EditRecordScreen recordId={params.id} />;
}
