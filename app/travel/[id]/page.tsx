import { TravelTripDetail } from "@/features/travel/components/travel-trip-detail";
import { AppShell } from "@/shared/components/layout/app-shell";
import { ListBackAction } from "@/shared/components/layout/list-back-action";

type TravelTripRoutePageProps = {
  params: {
    id: string;
  };
};

export default function TravelTripRoutePage({ params }: TravelTripRoutePageProps) {
  return (
    <AppShell title="여행 상세" actions={<ListBackAction href="/travel" />}>
      <TravelTripDetail tripId={params.id} />
    </AppShell>
  );
}
