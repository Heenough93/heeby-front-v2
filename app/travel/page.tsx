import { TravelPage } from "@/features/travel/components/travel-page";
import { AppShell } from "@/shared/components/layout/app-shell";

export default function TravelRoutePage() {
  return (
    <AppShell
      title="여행 지도"
      description="도시 좌표와 방문 날짜를 쌓아두고, 세계지도 위에서 이동 흐름을 순서대로 확인합니다."
    >
      <TravelPage />
    </AppShell>
  );
}
