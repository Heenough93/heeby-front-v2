import { RoutineList } from "@/features/routines/components/routine-list";
import { RoutinePageActions } from "@/features/routines/components/routine-page-actions";
import { AppShell } from "@/shared/components/layout/app-shell";

export default function RoutinesPage() {
  return (
    <AppShell
      title="루틴"
      description="반복 일정과 텔레그램 메시지를 저장해, 기록과 회고를 다시 시작하게 만드는 리마인더를 관리합니다."
      actions={<RoutinePageActions />}
    >
      <RoutineList />
    </AppShell>
  );
}
