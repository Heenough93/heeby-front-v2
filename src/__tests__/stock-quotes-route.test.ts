import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../../app/api/stocks/quotes/route";

describe("POST /api/stocks/quotes", () => {
  const fetchMock = vi.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    global.fetch = originalFetch;
    delete process.env.YAHOO_QUOTE_BASE_URL;
  });

  it("rejects empty requests", async () => {
    const response = await POST(
      new Request("http://localhost/api/stocks/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ entries: [] })
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe("invalid_payload");
  });

  it("maps yahoo quote results back to trade ids", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            chart: {
              result: [
                {
                  meta: {
                    regularMarketPrice: 87000
                  }
                }
              ]
            }
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            chart: {
              result: [
                {
                  meta: {
                    regularMarketPrice: 999.12
                  }
                }
              ]
            }
          }),
          { status: 200 }
        )
      );

    const response = await POST(
      new Request("http://localhost/api/stocks/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          entries: [
            { id: "kr-1", ticker: "005930.KS", market: "KR" },
            { id: "us-1", ticker: "NVDA", market: "US" }
          ]
        })
      })
    );
    const payload = await response.json();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://query1.finance.yahoo.com/v8/finance/chart/005930.KS?interval=1d"
    );
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      "https://query1.finance.yahoo.com/v8/finance/chart/NVDA?interval=1d"
    );
    expect(response.status).toBe(200);
    expect(payload.quotes).toEqual([
      { id: "kr-1", currentPrice: 87000 },
      { id: "us-1", currentPrice: 999.12 }
    ]);
    expect(payload.failures).toEqual([]);
  });
});
