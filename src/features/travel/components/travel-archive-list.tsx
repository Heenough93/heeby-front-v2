"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { canManageTravel, getVisibilityLabel } from "@/features/access/lib/access-policy";
import {
  getAccessMode,
  useAccessStore
} from "@/features/access/store/access-store";
import {
  getTripPeriodLabel,
  getTripVisits,
  sortTravelTrips
} from "@/features/travel/lib/travel-map";
import { useTravelStore } from "@/features/travel/store/travel-store";
import { cn } from "@/lib/utils";

type VisibilityFilter = "전체" | "public" | "private";
type SortOption = "latest" | "oldest" | "name";

export function TravelArchiveList() {
  const accessMode = useAccessStore(getAccessMode);
  const getReadableTrips = useTravelStore((state) => state.getReadableTrips);
  const visits = useTravelStore((state) => state.visits);
  const [search, setSearch] = useState("");
  const [selectedVisibility, setSelectedVisibility] =
    useState<VisibilityFilter>("전체");
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  const trips = useMemo(
    () => getReadableTrips(accessMode),
    [accessMode, getReadableTrips]
  );

  const filteredTrips = useMemo(() => {
    const latestSortedTrips = sortTravelTrips(trips, visits);
    const normalizedSearch = search.trim().toLowerCase();

    const visibleTrips =
      selectedVisibility === "전체"
        ? latestSortedTrips
        : latestSortedTrips.filter((trip) => trip.visibility === selectedVisibility);

    const searchedTrips = normalizedSearch
      ? visibleTrips.filter((trip) => {
          const tripVisits = getTripVisits(trip.id, visits);
          const haystack = [
            trip.name,
            trip.note ?? "",
            trip.visibility,
            ...tripVisits.map((visit) => `${visit.city} ${visit.country} ${visit.note ?? ""}`)
          ]
            .join(" ")
            .toLowerCase();

          return haystack.includes(normalizedSearch);
        })
      : visibleTrips;

    return [...searchedTrips].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name, "ko");
      }

      const aLatestVisit = getTripVisits(a.id, visits).at(-1);
      const bLatestVisit = getTripVisits(b.id, visits).at(-1);
      const aValue = dayjs(aLatestVisit?.endedAt ?? aLatestVisit?.startedAt ?? a.createdAt).valueOf();
      const bValue = dayjs(bLatestVisit?.endedAt ?? bLatestVisit?.startedAt ?? b.createdAt).valueOf();

      if (sortBy === "oldest") {
        return aValue - bValue;
      }

      return bValue - aValue;
    });
  }, [search, selectedVisibility, sortBy, trips, visits]);

  const canManage = canManageTravel(accessMode);

  return (
    <section className="grid gap-6">
      {accessMode === "guest" ? (
        <div className="rounded-[24px] border border-line/10 bg-paper p-5 text-sm leading-6 text-ink/62">
          공개로 설정한 여행만 보입니다. 공개 여행은 상세에서 방문 순서와 이동 흐름을 그대로 볼 수 있습니다.
        </div>
      ) : null}

      <div className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink/75">검색</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="여행 이름, 도시, 국가, 메모로 검색"
              className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-surface"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink/75">정렬</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-surface"
            >
              <option value="latest">최신 이동순</option>
              <option value="oldest">오래된 이동순</option>
              <option value="name">이름순</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["전체", "public", "private"] as VisibilityFilter[]).map((visibility) => (
            <button
              key={visibility}
              type="button"
              onClick={() => setSelectedVisibility(visibility)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                selectedVisibility === visibility
                  ? "bg-coral text-white"
                  : "bg-paper text-ink/75 hover:bg-soft"
              )}
            >
              {visibility === "전체" ? visibility : getVisibilityLabel(visibility)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredTrips.map((trip) => {
          const tripVisits = getTripVisits(trip.id, visits);
          const previewVisit = tripVisits.at(-1);

          return (
            <article
              key={trip.id}
              className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
                    {getVisibilityLabel(trip.visibility)}
                  </span>
                  <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-ink/68">
                    방문지 {tripVisits.length}개
                  </span>
                  <span className="text-xs text-ink/45">{getTripPeriodLabel(tripVisits)}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/travel/${trip.id}`}
                    className="rounded-full border border-line/10 bg-paper px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
                  >
                    상세 보기
                  </Link>
                  {canManage ? (
                    <Link
                      href={`/travel/${trip.id}/edit`}
                      className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      수정
                    </Link>
                  ) : null}
                </div>
              </div>

              <h2 className="mt-4 text-xl font-semibold">{trip.name}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/65">
                {trip.note || "방문지 흐름과 이동 메모를 한 여행 아래로 묶었습니다."}
              </p>

              {previewVisit ? (
                <div className="mt-5 rounded-[22px] border border-line/10 bg-paper p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral/80">
                    Latest Stop
                  </p>
                  <p className="mt-2 text-base font-semibold">
                    {previewVisit.city}, {previewVisit.country}
                  </p>
                  {previewVisit.note ? (
                    <p className="mt-2 text-sm leading-6 text-ink/62">{previewVisit.note}</p>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {filteredTrips.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-line/15 bg-surface p-10 text-center shadow-card">
          <p className="text-lg font-semibold">
            {search ? "검색 결과가 없습니다." : "아직 여행이 없습니다."}
          </p>
          <p className="mt-2 text-sm text-ink/60">
            {search
              ? "검색어를 바꾸거나 공개 범위 필터를 조정해보세요."
              : canManage
                ? "새 여행을 만들고 방문지를 쌓아보세요."
                : "공개 여행이 생기면 이곳에서 바로 볼 수 있습니다."}
          </p>
        </div>
      ) : null}
    </section>
  );
}
