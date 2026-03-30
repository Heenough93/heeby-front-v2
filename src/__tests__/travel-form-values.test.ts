import { describe, expect, it } from "vitest";
import {
  defaultTravelVisitFormValues,
  getTravelVisitFormValues
} from "@/features/travel/lib/travel-form-values";
import { travelVisits } from "@/mocks/travel-visits";

describe("travel form values", () => {
  it("provides empty defaults for a new visit", () => {
    expect(defaultTravelVisitFormValues).toEqual({
      city: "",
      country: "",
      latitude: 37.5665,
      longitude: 126.978,
      startedAt: "",
      endedAt: "",
      note: ""
    });
  });

  it("maps an existing visit into editable form values", () => {
    expect(getTravelVisitFormValues(travelVisits[0])).toEqual({
      city: "서울",
      country: "대한민국",
      latitude: 37.5665,
      longitude: 126.978,
      startedAt: "2023-03-18",
      endedAt: "2023-03-21",
      note: "출발 전 주말에 정비하고 바로 이동 동선을 정리했다."
    });
  });
});
