import dayjs from "dayjs";
import type { TravelVisit } from "@/features/travel/lib/travel-types";

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
