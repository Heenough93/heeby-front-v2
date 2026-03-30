import { describe, expect, it } from "vitest";
import { mapNominatimItemToCandidate } from "@/features/travel/lib/travel-search";

describe("travel search mapping", () => {
  it("maps a nominatim search result into a travel candidate", () => {
    expect(
      mapNominatimItemToCandidate({
        place_id: 123,
        display_name: "Seoul, South Korea",
        lat: "37.5665",
        lon: "126.9780",
        address: {
          city: "Seoul",
          country: "South Korea"
        }
      })
    ).toEqual({
      placeId: 123,
      displayName: "Seoul, South Korea",
      city: "Seoul",
      country: "South Korea",
      latitude: 37.5665,
      longitude: 126.978
    });
  });

  it("falls back to town and filters invalid coordinates", () => {
    expect(
      mapNominatimItemToCandidate({
        place_id: 456,
        display_name: "Oxford, England, United Kingdom",
        lat: "51.7520",
        lon: "-1.2577",
        address: {
          town: "Oxford",
          country: "United Kingdom"
        }
      })
    ).toEqual({
      placeId: 456,
      displayName: "Oxford, England, United Kingdom",
      city: "Oxford",
      country: "United Kingdom",
      latitude: 51.752,
      longitude: -1.2577
    });

    expect(
      mapNominatimItemToCandidate({
        place_id: 789,
        display_name: "Broken Place",
        lat: "NaN",
        lon: "127.0",
        address: {
          city: "Broken",
          country: "Nowhere"
        }
      })
    ).toBeNull();
  });
});
