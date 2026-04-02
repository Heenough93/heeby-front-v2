import { EditRoutineScreen } from "@/features/routines/components/edit-routine-screen";

type EditRoutineRoutePageProps = {
  params: {
    id: string;
  };
};

export default function EditRoutineRoutePage({
  params
}: EditRoutineRoutePageProps) {
  return <EditRoutineScreen routineId={params.id} />;
}
