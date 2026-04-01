"use client";

import React from "react";
import { formatTravelPeriod, sortTravelVisits } from "@/features/travel/lib/travel-map";
import type { TravelVisit } from "@/features/travel/lib/travel-types";
import { cn } from "@/lib/utils";

type TravelVisitListProps = {
  visits: TravelVisit[];
  selectedVisitId?: string;
  onSelectVisit?: (visitId: string) => void;
  onEdit?: (visit: TravelVisit) => void;
  onRemove?: (id: string) => void;
};

export function TravelVisitList({
  visits,
  selectedVisitId,
  onSelectVisit,
  onEdit,
  onRemove
}: TravelVisitListProps) {
  const sortedVisits = sortTravelVisits(visits);

  return (
    <section className="rounded-[28px] border border-line/10 bg-surface p-5 shadow-card md:p-6">
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

      <div className="mt-5 grid gap-3">
        {sortedVisits.map((visit, index) => (
          <article
            key={visit.id}
            className={formatVisitCardClassName(visit.id === selectedVisitId)}
          >
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => onSelectVisit?.(visit.id)}
                className="flex min-w-0 flex-1 gap-3 text-left"
              >
                <span
                  className={cn(
                    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
                    visit.id === selectedVisitId ? "bg-rose-600" : "bg-coral"
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-[0.2em]",
                      visit.id === selectedVisitId ? "text-rose-600" : "text-coral/80"
                    )}
                  >
                    {formatTravelPeriod(visit)}
                  </p>
                  <h3 className="mt-1.5 text-base font-semibold leading-tight">
                    {visit.city}, {visit.country}
                  </h3>
                  <p className="mt-1.5 text-xs text-ink/58">
                    위도 {visit.latitude.toFixed(4)} / 경도 {visit.longitude.toFixed(4)}
                  </p>
                  {visit.note ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-ink/66">
                      {visit.note}
                    </p>
                  ) : null}
                </div>
              </button>

              {onEdit || onRemove ? (
                <div className="flex shrink-0 gap-2">
                  {onEdit ? (
                    <button
                      type="button"
                      onClick={() => onEdit(visit)}
                      className="rounded-full border border-line/10 bg-surface px-3 py-2 text-xs font-semibold text-ink/65 transition hover:border-coral/35 hover:bg-soft"
                    >
                      수정
                    </button>
                  ) : null}
                  {onRemove ? (
                    <button
                      type="button"
                      onClick={() => onRemove(visit.id)}
                      className="rounded-full border border-line/10 bg-surface px-3 py-2 text-xs font-semibold text-ink/65 transition hover:border-coral/35 hover:bg-soft"
                    >
                      삭제
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function formatVisitCardClassName(isSelected: boolean) {
  return cn(
    "rounded-[22px] border bg-paper px-4 py-4 transition",
    isSelected
      ? "border-rose-300 bg-rose-50/70 shadow-[0_10px_30px_rgba(244,63,94,0.14)]"
      : "border-line/10"
  );
}
