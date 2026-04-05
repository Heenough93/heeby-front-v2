"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/shared/components/layout/app-shell";
import { ListBackAction } from "@/shared/components/layout/list-back-action";
import { AlertDialog } from "@/shared/components/feedback/alert-dialog";
import { getVisibilityLabel } from "@/features/access/lib/access-policy";
import { TravelTripForm } from "@/features/travel/components/travel-trip-form";
import { TravelVisitForm } from "@/features/travel/components/travel-visit-form";
import { TravelVisitList } from "@/features/travel/components/travel-visit-list";
import { WorldTravelMap } from "@/features/travel/components/world-travel-map";
import { getTravelTripFormValues } from "@/features/travel/lib/travel-trip-form-values";
import {
  getTripPeriodLabel,
  getTripVisits
} from "@/features/travel/lib/travel-map";
import type { TravelTripFormValues } from "@/features/travel/lib/travel-trip-schema";
import type { TravelVisitFormValues } from "@/features/travel/lib/travel-visit-schema";
import type { TravelVisit } from "@/features/travel/lib/travel-types";
import { useTravelStore } from "@/features/travel/store/travel-store";
import { useToastStore } from "@/stores/ui/use-toast-store";

type EditTravelTripScreenProps = {
  tripId: string;
};

export function EditTravelTripScreen({ tripId }: EditTravelTripScreenProps) {
  const router = useRouter();
  const trip = useTravelStore((state) => state.getTripById(tripId));
  const visits = useTravelStore((state) => state.visits);
  const updateTrip = useTravelStore((state) => state.updateTrip);
  const removeTrip = useTravelStore((state) => state.removeTrip);
  const addVisit = useTravelStore((state) => state.addVisit);
  const updateVisit = useTravelStore((state) => state.updateVisit);
  const removeVisit = useTravelStore((state) => state.removeVisit);
  const showToast = useToastStore((state) => state.showToast);
  const [isVisitFormOpen, setIsVisitFormOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<TravelVisit | undefined>();
  const [selectedVisitId, setSelectedVisitId] = useState<string | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const tripVisits = useMemo(
    () => (trip ? getTripVisits(trip.id, visits) : []),
    [trip, visits]
  );

  useEffect(() => {
    if (tripVisits.length === 0) {
      setSelectedVisitId(undefined);
      return;
    }

    if (!selectedVisitId || !tripVisits.some((visit) => visit.id === selectedVisitId)) {
      setSelectedVisitId(tripVisits[tripVisits.length - 1]?.id);
    }
  }, [selectedVisitId, tripVisits]);

  useEffect(() => {
    if (!isVisitFormOpen) {
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisitFormOpen]);

  const handleCloseVisitForm = () => {
    setIsVisitFormOpen(false);
    setEditingVisit(undefined);
  };

  if (!trip) {
    return (
      <AppShell
        title="여행 수정"
        description="수정할 여행을 찾을 수 없습니다."
      >
        <section className="rounded-[28px] border border-line/10 bg-surface p-8 shadow-card">
          <p className="text-lg font-semibold">여행을 찾을 수 없습니다.</p>
          <Link
            href="/travel"
            className="mt-5 inline-flex rounded-full bg-coral px-4 py-3 text-sm font-semibold text-white"
          >
            여행 목록으로
          </Link>
        </section>
      </AppShell>
    );
  }

  const handleTripSubmit = (values: TravelTripFormValues) => {
    const nextTrip = updateTrip(trip.id, values);

    if (!nextTrip) {
      showToast({
        title: "수정할 여행을 찾을 수 없습니다.",
        variant: "error"
      });
      return;
    }

    showToast({
      title: "여행 정보가 수정되었습니다.",
      variant: "success"
    });
  };

  const handleVisitSubmit = (values: TravelVisitFormValues) => {
    if (editingVisit) {
      const nextVisit = updateVisit(editingVisit.id, values);

      if (!nextVisit) {
        showToast({
          title: "수정할 방문지를 찾을 수 없습니다.",
          variant: "error"
        });
        handleCloseVisitForm();
        return;
      }

      showToast({
        title: `${nextVisit.city} 방문지가 수정되었습니다.`,
        variant: "success"
      });
      setSelectedVisitId(nextVisit.id);
      handleCloseVisitForm();
      return;
    }

    const nextVisit = addVisit(trip.id, values);
    showToast({
      title: `${nextVisit.city} 방문지가 추가되었습니다.`,
      variant: "success"
    });
    setSelectedVisitId(nextVisit.id);
    handleCloseVisitForm();
  };

  return (
    <AppShell
      title="여행 수정"
      description="여행 정보와 공개 범위를 수정하고, 같은 화면에서 방문지를 계속 관리합니다."
      actions={<ListBackAction href="/travel" />}
    >
      <div className="grid gap-6">
        <section className="rounded-[30px] border border-line/10 bg-surface p-6 shadow-card md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-coral px-3 py-1 text-xs font-semibold text-white">
                  {getVisibilityLabel(trip.visibility)}
                </span>
                <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/70">
                  방문지 {tripVisits.length}개
                </span>
                <span className="text-sm text-ink/50">{getTripPeriodLabel(tripVisits)}</span>
              </div>
              <h2 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
                {trip.name}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink/68">
                {trip.note || "여행 이름과 공개 범위를 정리하고, 아래에서 방문지를 계속 추가합니다."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/travel/${trip.id}`}
                className="rounded-full border border-line/10 bg-surface px-5 py-3 text-sm font-semibold text-ink transition hover:border-coral/40 hover:bg-soft"
              >
                상세 보기
              </Link>
              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                여행 삭제
              </button>
            </div>
          </div>
        </section>

        <TravelTripForm
          trip={trip}
          submitLabel="여행 정보 저장"
          onSubmit={handleTripSubmit}
          className="border border-line/10"
        />

        <section className="rounded-[30px] border border-line/10 bg-surface p-6 shadow-card md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
                Route Map
              </p>
              <h2 className="mt-2 text-3xl font-bold">방문지 편집</h2>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-ink/64">
                이 여행에 속한 방문지만 지도와 타임라인에 묶어서 관리합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingVisit(undefined);
                setIsVisitFormOpen(true);
              }}
              className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              방문지 추가
            </button>
          </div>

          <div className="mt-6">
            <WorldTravelMap
              visits={tripVisits}
              selectedVisitId={selectedVisitId}
              onSelectVisit={setSelectedVisitId}
            />
          </div>
        </section>

        <TravelVisitList
          visits={tripVisits}
          selectedVisitId={selectedVisitId}
          onSelectVisit={setSelectedVisitId}
          onEdit={(visit) => {
            setSelectedVisitId(visit.id);
            setEditingVisit(visit);
            setIsVisitFormOpen(true);
          }}
          onRemove={(id) => {
            removeVisit(id);
            showToast({
              title: "방문지가 삭제되었습니다.",
              variant: "info"
            });
          }}
        />

        {isVisitFormOpen ? (
          <div className="fixed inset-0 z-[80] flex items-end justify-center md:items-center md:px-4 md:py-8">
            <button
              type="button"
              onClick={handleCloseVisitForm}
              className="absolute inset-0 bg-ink/45"
              aria-label="방문지 입력 모달 닫기"
            />

            <div className="relative z-10 w-full md:max-w-2xl">
              <TravelVisitForm
                visit={editingVisit}
                submitLabel={editingVisit ? "변경 저장" : "방문지 추가"}
                className="max-h-[92dvh] overflow-y-auto rounded-t-[28px] border-0 px-5 pb-5 pt-6 shadow-[0_-20px_60px_rgba(15,23,42,0.24)] md:max-h-none md:rounded-[28px] md:px-7 md:py-7 md:shadow-card"
                onSubmit={handleVisitSubmit}
              />

              <div className="pointer-events-none absolute right-5 top-5 z-20 md:right-7 md:top-7">
                <button
                  type="button"
                  onClick={handleCloseVisitForm}
                  className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-line/10 bg-paper text-lg transition hover:border-coral/35 hover:bg-soft"
                  aria-label="모달 닫기"
                >
                  <span aria-hidden>✕</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <AlertDialog
          open={isDeleteDialogOpen}
          title="이 여행을 삭제할까요?"
          description="삭제 후에는 이 여행과 포함된 방문지를 이 브라우저에서 다시 복구할 수 없습니다."
          confirmLabel="여행 삭제"
          variant="danger"
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => {
            removeTrip(trip.id);
            showToast({
              title: "여행과 방문지가 삭제되었습니다.",
              variant: "success"
            });
            setIsDeleteDialogOpen(false);
            router.push("/travel");
          }}
        />
      </div>
    </AppShell>
  );
}
