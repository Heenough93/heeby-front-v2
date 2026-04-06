"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/shared/components/layout/app-shell";
import { RoutineForm } from "@/features/routines/components/routine-form";
import type { RoutineFormValues } from "@/features/routines/lib/routine-schema";
import { useRoutineStore } from "@/features/routines/store/routine-store";
import { useToastStore } from "@/stores/ui/use-toast-store";
import { ListBackAction } from "@/shared/components/layout/list-back-action";

export function NewRoutineScreen() {
  const router = useRouter();
  const addRoutine = useRoutineStore((state) => state.addRoutine);
  const showToast = useToastStore((state) => state.showToast);

  const handleSubmit = (values: RoutineFormValues) => {
    const nextRoutine = addRoutine(values);

    showToast({
      title: "루틴이 저장되었습니다.",
      variant: "success"
    });
    router.push(`/routines/${nextRoutine.id}`);
  };

  return (
    <AppShell title="새 루틴" actions={<ListBackAction href="/routines" />}>
      <RoutineForm onSubmit={handleSubmit} submitLabel="루틴 저장" />
    </AppShell>
  );
}
