import dayjs from "dayjs";
import type { TravelTrip, TravelVisit } from "@/features/travel/lib/travel-types";

export function sortTravelVisits(visits: TravelVisit[]) {
  return [...visits].sort((a, b) => {
    const startDiff = dayjs(a.startedAt).valueOf() - dayjs(b.startedAt).valueOf();

    if (startDiff !== 0) {
      return startDiff;
    }

    return dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf();
  });
}

export function formatTravelPeriod(visit: TravelVisit) {
  const startLabel = dayjs(visit.startedAt).format("YYYY.MM.DD");

  if (!visit.endedAt || visit.endedAt === visit.startedAt) {
    return startLabel;
  }

  return `${startLabel} - ${dayjs(visit.endedAt).format("YYYY.MM.DD")}`;
}

export function getTripVisits(tripId: string, visits: TravelVisit[]) {
  return sortTravelVisits(visits.filter((visit) => visit.tripId === tripId));
}

export function getTripPeriodLabel(visits: TravelVisit[]) {
  if (visits.length === 0) {
    return "방문 기록 없음";
  }

  const sortedVisits = sortTravelVisits(visits);
  const firstVisit = sortedVisits[0];
  const lastVisit = sortedVisits[sortedVisits.length - 1];
  const startLabel = dayjs(firstVisit.startedAt).format("YYYY.MM.DD");
  const endLabel = dayjs(lastVisit.endedAt ?? lastVisit.startedAt).format("YYYY.MM.DD");

  return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
}

export function getLatestTripVisit(visits: TravelVisit[]) {
  return sortTravelVisits(visits).at(-1);
}

export function sortTravelTrips(
  trips: TravelTrip[],
  visits: TravelVisit[]
) {
  return [...trips].sort((a, b) => {
    const aLatest = getLatestTripVisit(getTripVisits(a.id, visits));
    const bLatest = getLatestTripVisit(getTripVisits(b.id, visits));

    if (aLatest && bLatest) {
      return (
        dayjs(bLatest.endedAt ?? bLatest.startedAt).valueOf() -
        dayjs(aLatest.endedAt ?? aLatest.startedAt).valueOf()
      );
    }

    if (aLatest) {
      return -1;
    }

    if (bLatest) {
      return 1;
    }

    return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
  });
}
