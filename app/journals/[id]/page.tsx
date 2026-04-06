import Link from "next/link";
import { AppShell } from "@/shared/components/layout/app-shell";
import { JournalDetail } from "@/features/journals/components/journal-detail";
import { ListBackAction } from "@/shared/components/layout/list-back-action";

type JournalDetailPageProps = {
  params: {
    id: string;
  };
};

export default function JournalDetailPage({ params }: JournalDetailPageProps) {
  return (
    <AppShell title="기록 상세" actions={<ListBackAction href="/journals" />}>
      <JournalDetail journalId={params.id} />
    </AppShell>
  );
}
