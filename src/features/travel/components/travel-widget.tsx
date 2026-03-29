"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatTravelPeriod, sortTravelVisits } from "@/features/travel/lib/travel-map";
import { WorldTravelMap } from "@/features/travel/components/world-travel-map";
import type { TravelVisit } from "@/features/travel/lib/travel-types";

type TravelWidgetProps = {
  visits: TravelVisit[];
};

export function TravelWidget({ visits }: TravelWidgetProps) {
  const sortedVisits = useMemo(() => sortTravelVisits(visits), [visits]);
  const latestVisit = sortedVisits.at(-1);

  return (
    <section className="rounded-[30px] border border-line/10 bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
            Travel Widget
          </p>
          <h3 className="mt-2 text-xl font-bold">방문 지도</h3>
        </div>
        <Link
          href="/travel"
          className="rounded-full border border-line/10 bg-paper px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
        >
          전체 보기
        </Link>
      </div>

      <p className="mt-3 text-sm leading-6 text-ink/62">
        도시 좌표를 이어서 이동 흐름을 한 번에 봅니다. 방문 순서는 시작일 기준으로
        정렬됩니다.
      </p>

      <div className="mt-5">
        <WorldTravelMap visits={sortedVisits} compact />
      </div>

      {latestVisit ? (
        <div className="mt-5 rounded-[24px] border border-line/10 bg-paper p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">
            Latest Stop
          </p>
          <p className="mt-2 text-lg font-semibold">
            {latestVisit.city}, {latestVisit.country}
          </p>
          <p className="mt-1 text-sm text-ink/60">{formatTravelPeriod(latestVisit)}</p>
          {latestVisit.note ? (
            <p className="mt-3 text-sm leading-6 text-ink/68">{latestVisit.note}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
