import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TravelTripDetail } from "@/features/travel/components/travel-trip-detail";
import { useAccessStore } from "@/features/access/store/access-store";
import { useTravelStore } from "@/features/travel/store/travel-store";

vi.mock("@/features/travel/components/world-travel-map", () => ({
  WorldTravelMap: () => <div>mock-travel-map</div>
}));

describe("TravelTripDetail access", () => {
  beforeEach(() => {
    useAccessStore.setState({
      isAuthenticated: false,
      isAdminUnlocked: false
    });
  });

  it("shows a public trip to guests", () => {
    useTravelStore.setState({
      trips: [
        {
          id: "trip-public",
          name: "공개 여행",
          visibility: "public",
          note: "공개용 여행 메모",
          createdAt: "2026-03-01T00:00:00.000Z",
          updatedAt: "2026-03-01T00:00:00.000Z"
        }
      ],
      visits: [
        {
          id: "visit-1",
          tripId: "trip-public",
          city: "서울",
          country: "대한민국",
          latitude: 37.5665,
          longitude: 126.978,
          startedAt: "2026-03-03",
          endedAt: "2026-03-04",
          note: "공개 방문 메모",
          createdAt: "2026-03-01T00:00:00.000Z",
          updatedAt: "2026-03-01T00:00:00.000Z"
        }
      ]
    });

    render(<TravelTripDetail tripId="trip-public" />);

    expect(screen.getByText("공개 여행")).toBeInTheDocument();
    expect(screen.getByText("공개용 여행 메모")).toBeInTheDocument();
  });

  it("hides a private trip from guests", () => {
    useTravelStore.setState({
      trips: [
        {
          id: "trip-private",
          name: "비공개 여행",
          visibility: "private",
          note: "비공개 메모",
          createdAt: "2026-03-01T00:00:00.000Z",
          updatedAt: "2026-03-01T00:00:00.000Z"
        }
      ],
      visits: []
    });

    render(<TravelTripDetail tripId="trip-private" />);

    expect(screen.getByText("여행을 찾을 수 없습니다.")).toBeInTheDocument();
    expect(screen.queryByText("비공개 메모")).not.toBeInTheDocument();
  });
});
