import type { TravelVisitFormValues } from "@/features/travel/lib/travel-visit-schema";
import type { TravelVisit } from "@/features/travel/lib/travel-types";

export const defaultTravelVisitFormValues: TravelVisitFormValues = {
  city: "",
  country: "",
  latitude: 37.5665,
  longitude: 126.978,
  startedAt: "",
  endedAt: "",
  note: ""
};

export function getTravelVisitFormValues(visit: TravelVisit): TravelVisitFormValues {
  return {
    city: visit.city,
    country: visit.country,
    latitude: visit.latitude,
    longitude: visit.longitude,
    startedAt: visit.startedAt,
    endedAt: visit.endedAt ?? "",
    note: visit.note ?? ""
  };
}
