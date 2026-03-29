import { describe, expect, it } from "vitest";
import { formatTravelPeriod, sortTravelVisits } from "@/features/travel/lib/travel-map";
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
});
