import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "../../app/api/travel/search/route";

describe("GET /api/travel/search", () => {
  const fetchMock = vi.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    global.fetch = originalFetch;
    delete process.env.NOMINATIM_BASE_URL;
    delete process.env.NOMINATIM_CONTACT_EMAIL;
    delete process.env.NOMINATIM_USER_AGENT;
  });

  it("rejects too-short queries", async () => {
    const response = await GET(
      new Request("http://localhost/api/travel/search?q=s")
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe("invalid_query");
  });

  it("returns mapped candidates from nominatim", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            place_id: 1,
            display_name: "Seoul, South Korea",
            lat: "37.5665",
            lon: "126.9780",
            address: {
              city: "Seoul",
              country: "South Korea"
            }
          }
        ]),
        { status: 200 }
      )
    );

    const response = await GET(
      new Request("http://localhost/api/travel/search?q=Seoul")
    );
    const payload = await response.json();

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);
    expect(payload.candidates).toEqual([
      {
        placeId: 1,
        displayName: "Seoul, South Korea",
        city: "Seoul",
        country: "South Korea",
        latitude: 37.5665,
        longitude: 126.978
      }
    ]);
  });
});
