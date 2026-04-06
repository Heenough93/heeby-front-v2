"use client";

import Link from "next/link";
import React, { useMemo } from "react";
import {
  canManageTravel,
  getVisibilityLabel
} from "@/features/access/lib/access-policy";
import {
  getAccessMode,
  useAccessStore
} from "@/features/access/store/access-store";
import { TravelVisitList } from "@/features/travel/components/travel-visit-list";
import { WorldTravelMap } from "@/features/travel/components/world-travel-map";
import {
  getLatestTripVisit,
  getTripPeriodLabel,
  sortTravelVisits
} from "@/features/travel/lib/travel-map";
import { useTravelStore } from "@/features/travel/store/travel-store";

type TravelTripDetailProps = {
  tripId: string;
};

export function TravelTripDetail({ tripId }: TravelTripDetailProps) {
  const accessMode = useAccessStore(getAccessMode);
  const getReadableTripById = useTravelStore((state) => state.getReadableTripById);
  const getVisitsByTripId = useTravelStore((state) => state.getVisitsByTripId);

  const trip = useMemo(
    () => getReadableTripById(tripId, accessMode),
    [accessMode, getReadableTripById, tripId]
  );
  const visits = useMemo(() => {
    if (!trip) {
      return [];
    }

    return sortTravelVisits(getVisitsByTripId(trip.id));
  }, [getVisitsByTripId, trip]);
  const latestVisit = useMemo(() => getLatestTripVisit(visits), [visits]);
  const canManage = canManageTravel(accessMode);

  if (!trip) {
    return (
      <section className="rounded-[28px] border border-line/10 bg-surface p-8 shadow-card">
        <p className="text-lg font-semibold">여행을 찾을 수 없습니다.</p>
        <p className="mt-2 text-sm text-ink/60">
          삭제되었거나 현재 접근할 수 없는 비공개 여행일 수 있습니다.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex rounded-full bg-coral px-4 py-3 text-sm font-semibold text-white"
          >
            홈으로 이동
          </Link>
          <Link
            href="/travel"
            className="inline-flex rounded-full border border-line/10 bg-paper px-4 py-3 text-sm font-semibold"
          >
            여행 아카이브로
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[30px] border border-line/10 bg-surface p-6 shadow-card md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-coral px-3 py-1 text-xs font-semibold text-white">
                {getVisibilityLabel(trip.visibility)}
              </span>
              <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/70">
                방문지 {visits.length}개
              </span>
              <span className="text-sm text-ink/50">{getTripPeriodLabel(visits)}</span>
            </div>
            <h2 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
              {trip.name}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-ink/68">
              {trip.note || "선택한 여행 아래에 속한 방문지를 하나의 흐름으로 묶어봅니다."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {canManage ? (
              <Link
                href={`/travel/${trip.id}/edit`}
                className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                수정
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-6">
          <WorldTravelMap visits={visits} />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <TravelVisitList
          visits={visits}
          onSelectVisit={() => {}}
          onEdit={() => {}}
          onRemove={() => {}}
        />

        <section className="rounded-[28px] border border-line/10 bg-surface p-5 shadow-card md:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
            Summary
          </p>
          <h2 className="mt-2 text-2xl font-bold">여행 메모</h2>

          <dl className="mt-5 grid gap-4 text-sm">
            <div>
              <dt className="text-ink/55">공개 범위</dt>
              <dd className="mt-1 font-semibold text-ink">
                {getVisibilityLabel(trip.visibility)}
              </dd>
            </div>
            <div>
              <dt className="text-ink/55">기간</dt>
              <dd className="mt-1 font-semibold text-ink">{getTripPeriodLabel(visits)}</dd>
            </div>
            <div>
              <dt className="text-ink/55">최근 방문</dt>
              <dd className="mt-1 font-semibold text-ink">
                {latestVisit
                  ? `${latestVisit.city}, ${latestVisit.country}`
                  : "방문 기록 없음"}
              </dd>
            </div>
          </dl>

          {latestVisit?.note ? (
            <div className="mt-6 rounded-[22px] border border-line/10 bg-paper p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral/80">
                Latest Note
              </p>
              <p className="mt-3 text-sm leading-6 text-ink/68">{latestVisit.note}</p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
