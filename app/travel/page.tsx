import { AppShell } from "@/shared/components/layout/app-shell";
import { TravelArchiveList } from "@/features/travel/components/travel-archive-list";
import { TravelPageActions } from "@/features/travel/components/travel-page-actions";

export default function TravelRoutePage() {
  return (
    <AppShell title="여행" actions={<TravelPageActions />}>
      <TravelArchiveList />
    </AppShell>
  );
}
