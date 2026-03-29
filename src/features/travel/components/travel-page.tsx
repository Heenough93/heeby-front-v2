"use client";

import { useEffect, useMemo, useState } from "react";
import { useToastStore } from "@/stores/ui/use-toast-store";
import { WorldTravelMap } from "@/features/travel/components/world-travel-map";
import { TravelVisitForm } from "@/features/travel/components/travel-visit-form";
import { TravelVisitList } from "@/features/travel/components/travel-visit-list";
import { sortTravelVisits } from "@/features/travel/lib/travel-map";
import { useTravelStore } from "@/features/travel/store/travel-store";

export function TravelPage() {
  const visits = useTravelStore((state) => state.visits);
  const addVisit = useTravelStore((state) => state.addVisit);
  const removeVisit = useTravelStore((state) => state.removeVisit);
  const showToast = useToastStore((state) => state.showToast);
  const [isVisitFormOpen, setIsVisitFormOpen] = useState(false);
  const sortedVisits = useMemo(() => sortTravelVisits(visits), [visits]);

  useEffect(() => {
    if (!isVisitFormOpen) {
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisitFormOpen]);

  return (
    <div className="grid gap-6">
      <section className="rounded-[30px] border border-line/10 bg-surface p-6 shadow-card md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
              Route Map
            </p>
            <h2 className="mt-2 text-3xl font-bold">세계 이동 경로</h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-ink/64">
              세계 전체를 한 판에 두고, 다녀온 도시를 날짜 순서대로 선으로 잇습니다.
              여행 기록이 쌓일수록 이동 패턴이 지도 위에 남습니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-[22px] border border-line/10 bg-paper px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.22em] text-ink/50">
                Stops
              </p>
              <p className="mt-1 text-2xl font-bold">{sortedVisits.length}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsVisitFormOpen(true)}
              className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              방문지 추가
            </button>
          </div>
        </div>

        <div className="mt-6">
          <WorldTravelMap visits={sortedVisits} />
        </div>
      </section>

      <TravelVisitList
        visits={sortedVisits}
        onRemove={(id) => {
          removeVisit(id);
          showToast({
            title: "방문지가 삭제되었습니다.",
            variant: "info"
          });
        }}
      />

      {isVisitFormOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-8">
          <button
            type="button"
            onClick={() => setIsVisitFormOpen(false)}
            className="absolute inset-0 bg-ink/45"
            aria-label="방문지 추가 모달 닫기"
          />

          <div className="relative z-10 w-full max-w-2xl">
            <TravelVisitForm
              showHeader={false}
              className="border-0 px-6 pb-6 pt-32 md:px-7 md:pb-7 md:pt-36"
              onSubmit={(values) => {
                const nextVisit = addVisit(values);
                showToast({
                  title: `${nextVisit.city} 방문지가 추가되었습니다.`,
                  variant: "success"
                });
                setIsVisitFormOpen(false);
              }}
            />

            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between px-6 py-6 md:px-7">
              <div className="pointer-events-auto">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
                  Add Visit
                </p>
                <h2 className="mt-2 text-2xl font-bold">방문지 추가</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-ink/62">
                  도시, 날짜, 좌표를 넣으면 지도와 연결선에 바로 반영됩니다.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsVisitFormOpen(false)}
                className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-line/10 bg-paper text-lg transition hover:border-coral/35 hover:bg-soft"
                aria-label="모달 닫기"
              >
                <span aria-hidden>✕</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
