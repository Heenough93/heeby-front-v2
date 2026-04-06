import { RoutineDetail } from "@/features/routines/components/routine-detail";
import { AppShell } from "@/shared/components/layout/app-shell";
import { ListBackAction } from "@/shared/components/layout/list-back-action";

type RoutineRoutePageProps = {
  params: {
    id: string;
  };
};

export default function RoutineRoutePage({ params }: RoutineRoutePageProps) {
  return (
    <AppShell title="루틴 상세" actions={<ListBackAction href="/routines" />}>
      <RoutineDetail routineId={params.id} />
    </AppShell>
  );
}
