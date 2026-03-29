"use client";

import { formatTravelPeriod, sortTravelVisits } from "@/features/travel/lib/travel-map";
import type { TravelVisit } from "@/features/travel/lib/travel-types";

type TravelVisitListProps = {
  visits: TravelVisit[];
  onRemove: (id: string) => void;
};

export function TravelVisitList({ visits, onRemove }: TravelVisitListProps) {
  const sortedVisits = sortTravelVisits(visits);

  return (
    <section className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
            Timeline
          </p>
          <h2 className="mt-2 text-2xl font-bold">방문 순서</h2>
        </div>
        <span className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink/62">
          총 {sortedVisits.length}개
        </span>
      </div>

      <div className="mt-6 grid gap-4">
        {sortedVisits.map((visit, index) => (
          <article
            key={visit.id}
            className="rounded-[24px] border border-line/10 bg-paper p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral text-sm font-semibold text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">
                    {formatTravelPeriod(visit)}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold">
                    {visit.city}, {visit.country}
                  </h3>
                  <p className="mt-2 text-sm text-ink/60">
                    위도 {visit.latitude.toFixed(4)} / 경도 {visit.longitude.toFixed(4)}
                  </p>
                  {visit.note ? (
                    <p className="mt-3 text-sm leading-6 text-ink/68">{visit.note}</p>
                  ) : null}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onRemove(visit.id)}
                className="rounded-full border border-line/10 bg-surface px-4 py-2 text-sm font-semibold text-ink/65 transition hover:border-coral/35 hover:bg-soft"
              >
                삭제
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
