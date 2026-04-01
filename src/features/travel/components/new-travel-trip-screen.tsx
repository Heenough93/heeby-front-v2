"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/shared/components/layout/app-shell";
import { TravelTripForm } from "@/features/travel/components/travel-trip-form";
import type { TravelTripFormValues } from "@/features/travel/lib/travel-trip-schema";
import { useTravelStore } from "@/features/travel/store/travel-store";
import { useToastStore } from "@/stores/ui/use-toast-store";

export function NewTravelTripScreen() {
  const router = useRouter();
  const addTrip = useTravelStore((state) => state.addTrip);
  const showToast = useToastStore((state) => state.showToast);

  const handleSubmit = (values: TravelTripFormValues) => {
    const nextTrip = addTrip(values);

    showToast({
      title: "여행이 저장되었습니다. 이제 방문지를 추가해보세요.",
      variant: "success"
    });
    router.push(`/travel/${nextTrip.id}/edit`);
  };

  return (
    <AppShell
      title="새 여행"
      description="여행 이름과 공개 범위를 먼저 정한 뒤, 저장 후 방문지를 이어서 추가합니다."
    >
      <TravelTripForm onSubmit={handleSubmit} submitLabel="여행 저장" />
    </AppShell>
  );
}
