"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertDialog } from "@/shared/components/feedback/alert-dialog";
import { useRoutineStore } from "@/features/routines/store/routine-store";
import { getRoutineNextRunHint, getRoutineRepeatLabel } from "@/features/routines/lib/routine-schedule";
import { useToastStore } from "@/stores/ui/use-toast-store";

type RoutineDetailProps = {
  routineId: string;
};

export function RoutineDetail({ routineId }: RoutineDetailProps) {
  const router = useRouter();
  const routine = useRoutineStore((state) => state.getRoutineById(routineId));
  const removeRoutine = useRoutineStore((state) => state.removeRoutine);
  const showToast = useToastStore((state) => state.showToast);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!routine) {
    return (
      <section className="rounded-[28px] border border-line/10 bg-surface p-8 shadow-card">
        <p className="text-lg font-semibold">루틴을 찾을 수 없습니다.</p>
        <p className="mt-2 text-sm text-ink/60">
          삭제되었거나 현재 접근할 수 없는 루틴일 수 있습니다.
        </p>
        <Link
          href="/routines"
          className="mt-5 inline-flex rounded-full bg-coral px-4 py-3 text-sm font-semibold text-white"
        >
          루틴 목록으로
        </Link>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[32px] border border-line/10 bg-surface shadow-card">
      <div className="border-b border-line/10 bg-gradient-to-r from-soft/80 via-paper to-surface px-8 py-10 md:px-10 md:py-12">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-coral px-3 py-1 text-xs font-semibold text-white">
                {routine.isActive ? "활성" : "비활성"}
              </span>
              <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-ink/70">
                {getRoutineRepeatLabel(routine)}
              </span>
            </div>
            <h2 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
              {routine.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-ink/68">
              {routine.message}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/routines/${routine.id}/edit`}
              className="rounded-full border border-line/10 bg-surface/85 px-5 py-3 text-sm font-semibold text-ink transition hover:border-coral/40 hover:bg-soft"
            >
              수정
            </Link>
            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              삭제
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-10 px-8 py-8 md:grid-cols-[minmax(0,1fr)_280px] md:px-10 md:py-10">
        <div className="grid gap-6 order-2 md:order-1">
          <section className="rounded-[24px] border border-line/10 bg-paper p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
              Telegram Message
            </p>
            <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-ink/78">
              {routine.message}
            </p>
          </section>
        </div>

        <aside className="order-1 h-fit rounded-[24px] border border-line/10 bg-paper/85 p-5 md:order-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-coral">
            Routine Info
          </p>
          <dl className="mt-5 grid gap-4 text-sm">
            <div>
              <dt className="text-ink/45">채널</dt>
              <dd className="mt-1 font-semibold text-ink">Telegram</dd>
            </div>
            <div>
              <dt className="text-ink/45">반복</dt>
              <dd className="mt-1 font-semibold text-ink">{getRoutineRepeatLabel(routine)}</dd>
            </div>
            <div>
              <dt className="text-ink/45">상태</dt>
              <dd className="mt-1 font-semibold text-ink">{getRoutineNextRunHint(routine)}</dd>
            </div>
          </dl>
        </aside>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        title="이 루틴을 삭제할까요?"
        description="삭제 후에는 이 브라우저에서 다시 복구할 수 없습니다."
        confirmLabel="루틴 삭제"
        variant="danger"
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          removeRoutine(routine.id);
          showToast({
            title: "루틴이 삭제되었습니다.",
            variant: "success"
          });
          setIsDeleteDialogOpen(false);
          router.push("/routines");
        }}
      />
    </section>
  );
}
