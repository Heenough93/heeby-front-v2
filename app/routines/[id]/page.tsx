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
    <AppShell
      title="루틴 상세"
      description="저장된 반복 규칙과 텔레그램 메시지를 확인하고, 필요하면 다시 수정할 수 있습니다."
      actions={<ListBackAction href="/routines" />}
    >
      <RoutineDetail routineId={params.id} />
    </AppShell>
  );
}
