import type { TravelTripFormValues } from "@/features/travel/lib/travel-trip-schema";
import type { TravelTrip } from "@/features/travel/lib/travel-types";

export const defaultTravelTripFormValues: TravelTripFormValues = {
  name: "",
  visibility: "private",
  note: ""
};

export function getTravelTripFormValues(trip: TravelTrip): TravelTripFormValues {
  return {
    name: trip.name,
    visibility: trip.visibility,
    note: trip.note ?? ""
  };
}
