import { EditTemplateScreen } from "@/components/templates/edit-template-screen";

type EditTemplatePageProps = {
  params: {
    id: string;
  };
};

export default function EditTemplatePage({ params }: EditTemplatePageProps) {
  return <EditTemplateScreen templateId={params.id} />;
}
