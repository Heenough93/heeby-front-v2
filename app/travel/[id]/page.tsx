import { TravelTripDetail } from "@/features/travel/components/travel-trip-detail";
import { AppShell } from "@/shared/components/layout/app-shell";

type TravelTripRoutePageProps = {
  params: {
    id: string;
  };
};

export default function TravelTripRoutePage({ params }: TravelTripRoutePageProps) {
  return (
    <AppShell
      title="여행 상세"
      description="공개 여행은 게스트도 읽을 수 있고, 로그인 상태에서는 같은 화면을 상세 아카이브처럼 사용할 수 있습니다."
    >
      <TravelTripDetail tripId={params.id} />
    </AppShell>
  );
}
