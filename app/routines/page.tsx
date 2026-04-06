import { RoutineList } from "@/features/routines/components/routine-list";
import { RoutinePageActions } from "@/features/routines/components/routine-page-actions";
import { AppShell } from "@/shared/components/layout/app-shell";

export default function RoutinesPage() {
  return (
    <AppShell title="루틴" actions={<RoutinePageActions />}>
      <RoutineList />
    </AppShell>
  );
}
