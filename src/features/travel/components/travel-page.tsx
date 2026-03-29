"use client";

import { useMemo } from "react";
import { useToastStore } from "@/stores/ui/use-toast-store";
import { WorldTravelMap } from "@/features/travel/components/world-travel-map";
import { TravelVisitForm } from "@/features/travel/components/travel-visit-form";
import { TravelVisitList } from "@/features/travel/components/travel-visit-list";
import { formatTravelPeriod, sortTravelVisits } from "@/features/travel/lib/travel-map";
import { useTravelStore } from "@/features/travel/store/travel-store";

export function TravelPage() {
  const visits = useTravelStore((state) => state.visits);
  const addVisit = useTravelStore((state) => state.addVisit);
  const removeVisit = useTravelStore((state) => state.removeVisit);
  const showToast = useToastStore((state) => state.showToast);
  const sortedVisits = useMemo(() => sortTravelVisits(visits), [visits]);
  const latestVisit = sortedVisits.at(-1);

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.8fr]">
        <div className="rounded-[30px] border border-line/10 bg-surface p-6 shadow-card md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
                Route Map
              </p>
              <h2 className="mt-2 text-3xl font-bold">세계 이동 경로</h2>
            </div>
            <div className="rounded-[22px] border border-line/10 bg-paper px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.22em] text-ink/50">
                Stops
              </p>
              <p className="mt-1 text-2xl font-bold">{sortedVisits.length}</p>
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-ink/64">
            세계 전체를 한 판에 두고, 다녀온 도시를 날짜 순서대로 선으로 잇습니다.
            여행 기록이 쌓일수록 이동 패턴이 지도 위에 남습니다.
          </p>

          <div className="mt-6">
            <WorldTravelMap visits={sortedVisits} />
          </div>
        </div>

        <div className="grid gap-6">
          <section className="rounded-[30px] border border-line/10 bg-surface p-6 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
              Snapshot
            </p>
            <h2 className="mt-2 text-2xl font-bold">최근 방문</h2>

            {latestVisit ? (
              <div className="mt-5 rounded-[24px] border border-line/10 bg-paper p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">
                  {formatTravelPeriod(latestVisit)}
                </p>
                <p className="mt-2 text-2xl font-bold">
                  {latestVisit.city}, {latestVisit.country}
                </p>
                <p className="mt-3 text-sm text-ink/60">
                  위도 {latestVisit.latitude.toFixed(4)} / 경도{" "}
                  {latestVisit.longitude.toFixed(4)}
                </p>
                {latestVisit.note ? (
                  <p className="mt-4 text-sm leading-6 text-ink/68">
                    {latestVisit.note}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-ink/62">
                아직 저장된 방문지가 없습니다.
              </p>
            )}
          </section>

          <TravelVisitForm
            onSubmit={(values) => {
              const nextVisit = addVisit(values);
              showToast({
                title: `${nextVisit.city} 방문지가 추가되었습니다.`,
                variant: "success"
              });
            }}
          />
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
    </div>
  );
}
