import { AppShell } from "@/shared/components/layout/app-shell";
import { TravelArchiveList } from "@/features/travel/components/travel-archive-list";
import { TravelPageActions } from "@/features/travel/components/travel-page-actions";

export default function TravelRoutePage() {
  return (
    <AppShell
      title="여행"
      description="공개 가능한 여행 아카이브를 둘러보고, 선택한 여행의 이동 흐름과 방문 순서를 상세에서 확인합니다."
      actions={<TravelPageActions />}
    >
      <TravelArchiveList />
    </AppShell>
  );
}
