import { describe, expect, it } from "vitest";
import {
  formatTravelPeriod,
  getTripPeriodLabel,
  sortTravelTrips,
  sortTravelVisits
} from "@/features/travel/lib/travel-map";
import { travelTrips } from "@/mocks/travel-trips";
import { travelVisits } from "@/mocks/travel-visits";

describe("travel map utilities", () => {
  it("sorts visits by startedAt", () => {
    const visits = [travelVisits[2], travelVisits[0], travelVisits[1]];
    const sortedIds = sortTravelVisits(visits).map((visit) => visit.id);

    expect(sortedIds).toEqual([
      "travel-seoul",
      "travel-tokyo",
      "travel-singapore"
    ]);
  });

  it("formats a travel period range", () => {
    expect(formatTravelPeriod(travelVisits[0])).toBe("2023.03.18 - 2023.03.21");
  });

  it("formats a trip period from its visits", () => {
    const eastAsiaVisits = travelVisits.filter(
      (visit) => visit.tripId === "trip-east-asia-2023"
    );

    expect(getTripPeriodLabel(eastAsiaVisits)).toBe("2023.03.18 - 2023.08.11");
  });

  it("sorts trips by latest visit date", () => {
    const sortedIds = sortTravelTrips(travelTrips, travelVisits).map((trip) => trip.id);

    expect(sortedIds).toEqual([
      "trip-usa-2024",
      "trip-europe-2024",
      "trip-east-asia-2023"
    ]);
  });
});
