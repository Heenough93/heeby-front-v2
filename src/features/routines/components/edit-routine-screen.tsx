"use client";

import Link from "next/link";
import { AppShell } from "@/shared/components/layout/app-shell";
import { RoutineForm } from "@/features/routines/components/routine-form";
import type { RoutineFormValues } from "@/features/routines/lib/routine-schema";
import { useRoutineStore } from "@/features/routines/store/routine-store";
import { useToastStore } from "@/stores/ui/use-toast-store";
import { ListBackAction } from "@/shared/components/layout/list-back-action";

type EditRoutineScreenProps = {
  routineId: string;
};

export function EditRoutineScreen({ routineId }: EditRoutineScreenProps) {
  const routine = useRoutineStore((state) => state.getRoutineById(routineId));
  const updateRoutine = useRoutineStore((state) => state.updateRoutine);
  const showToast = useToastStore((state) => state.showToast);

  if (!routine) {
    return (
      <AppShell
        title="루틴 수정"
        description="수정할 루틴을 찾을 수 없습니다."
      >
        <section className="rounded-[28px] border border-line/10 bg-surface p-8 shadow-card">
          <p className="text-lg font-semibold">루틴을 찾을 수 없습니다.</p>
          <Link
            href="/routines"
            className="mt-5 inline-flex rounded-full bg-coral px-4 py-3 text-sm font-semibold text-white"
          >
            루틴 목록으로
          </Link>
        </section>
      </AppShell>
    );
  }

  const handleSubmit = (values: RoutineFormValues) => {
    const nextRoutine = updateRoutine(routine.id, values);

    if (!nextRoutine) {
      showToast({
        title: "수정할 루틴을 찾을 수 없습니다.",
        variant: "error"
      });
      return;
    }

    showToast({
      title: "루틴이 수정되었습니다.",
      variant: "success"
    });
  };

  return (
    <AppShell
      title="루틴 수정"
      description="반복 방식과 메시지를 다시 조정해 텔레그램 리마인더를 관리합니다."
      actions={<ListBackAction href="/routines" />}
    >
      <RoutineForm
        routine={routine}
        onSubmit={handleSubmit}
        submitLabel="루틴 수정"
      />
    </AppShell>
  );
}
