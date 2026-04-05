import { NextResponse } from "next/server";

type QuoteRequestItem = {
  id: string;
  ticker: string;
};

type YahooQuoteItem = {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
      };
    }>;
  };
};

function getYahooQuoteBaseUrl() {
  return process.env.YAHOO_QUOTE_BASE_URL?.trim() || "https://query1.finance.yahoo.com";
}

export async function POST(request: Request) {
  let payload: { entries?: QuoteRequestItem[] };

  try {
    payload = (await request.json()) as { entries?: QuoteRequestItem[] };
  } catch {
    return NextResponse.json(
      {
        code: "invalid_payload",
        message: "가격 조회 요청 형식이 올바르지 않습니다."
      },
      { status: 400 }
    );
  }

  const entries = payload.entries ?? [];

  if (entries.length === 0) {
    return NextResponse.json(
      {
        code: "invalid_payload",
        message: "조회할 종목이 없습니다."
      },
      { status: 400 }
    );
  }

  const symbolEntries = entries
    .map((entry) => ({
      id: entry.id,
      symbol: entry.ticker.trim().toUpperCase()
    }))
    .filter((entry): entry is { id: string; symbol: string } => entry.symbol.length > 0);

  if (symbolEntries.length === 0) {
    return NextResponse.json({
      quotes: []
    });
  }

  try {
    const upstreamQuotes = await Promise.all(
      symbolEntries.map(async (entry) => {
        const response = await fetch(
          `${getYahooQuoteBaseUrl()}/v8/finance/chart/${entry.symbol}?interval=1d`,
          {
            headers: {
              Accept: "application/json"
            },
            next: {
              revalidate: 30
            }
          }
        );

        if (!response.ok) {
          return {
            id: entry.id,
            symbol: entry.symbol,
            success: false as const
          };
        }

        const payload = (await response.json()) as YahooQuoteItem;
        const currentPrice = payload.chart?.result?.[0]?.meta?.regularMarketPrice;

        if (typeof currentPrice !== "number") {
          return {
            id: entry.id,
            symbol: entry.symbol,
            success: false as const
          };
        }

        return {
          id: entry.id,
          symbol: entry.symbol,
          currentPrice,
          success: true as const
        };
      })
    );

    return NextResponse.json({
      quotes: upstreamQuotes
        .filter(
          (entry): entry is {
            id: string;
            symbol: string;
            currentPrice: number;
            success: true;
          } => entry.success
        )
        .map((entry) => ({
          id: entry.id,
          currentPrice: entry.currentPrice
        })),
      failures: upstreamQuotes
        .filter(
          (entry): entry is {
            id: string;
            symbol: string;
            success: false;
          } => !entry.success
        )
        .map((entry) => ({
          id: entry.id,
          symbol: entry.symbol
        }))
    });
  } catch {
    return NextResponse.json(
      {
        code: "quote_fetch_failed",
        message: "현재가 조회 중 오류가 발생했습니다."
      },
      { status: 502 }
    );
  }
}
