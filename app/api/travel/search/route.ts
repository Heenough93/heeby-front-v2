import { NextResponse } from "next/server";
import {
  mapNominatimItemToCandidate,
  type TravelSearchCandidate
} from "@/features/travel/lib/travel-search";

function getNominatimBaseUrl() {
  return process.env.NOMINATIM_BASE_URL?.trim() || "https://nominatim.openstreetmap.org";
}

function getNominatimContactEmail() {
  return process.env.NOMINATIM_CONTACT_EMAIL?.trim() || "";
}

function getNominatimUserAgent() {
  return process.env.NOMINATIM_USER_AGENT?.trim() || "Heeby/0.1";
}

function getNominatimAcceptLanguage() {
  return process.env.NOMINATIM_ACCEPT_LANGUAGE?.trim() || "en";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json(
      {
        code: "invalid_query",
        message: "검색어는 2자 이상 입력해주세요."
      },
      { status: 400 }
    );
  }

  const upstreamSearchParams = new URLSearchParams({
    q: query,
    format: "jsonv2",
    addressdetails: "1",
    "accept-language": getNominatimAcceptLanguage(),
    limit: "5"
  });
  const contactEmail = getNominatimContactEmail();

  if (contactEmail) {
    upstreamSearchParams.set("email", contactEmail);
  }

  try {
    const response = await fetch(
      `${getNominatimBaseUrl()}/search?${upstreamSearchParams.toString()}`,
      {
        headers: {
          "User-Agent": getNominatimUserAgent(),
          Accept: "application/json",
          "Accept-Language": getNominatimAcceptLanguage()
        },
        next: {
          revalidate: 60 * 60 * 24
        }
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          code: "search_failed",
          message: "장소 검색 서버에서 결과를 가져오지 못했습니다."
        },
        { status: 502 }
      );
    }

    const payload = (await response.json()) as Array<{
      place_id: number;
      display_name: string;
      lat: string;
      lon: string;
      address?: {
        city?: string;
        town?: string;
        village?: string;
        municipality?: string;
        county?: string;
        state?: string;
        country?: string;
      };
    }>;

    const candidates = payload
      .map(mapNominatimItemToCandidate)
      .filter(
        (candidate): candidate is TravelSearchCandidate => candidate !== null
      );

    return NextResponse.json(
      {
        candidates
      },
      {
        headers: {
          "Cache-Control": "s-maxage=86400, stale-while-revalidate=43200"
        }
      }
    );
  } catch {
    return NextResponse.json(
      {
        code: "search_failed",
        message: "장소 검색 요청 중 오류가 발생했습니다."
      },
      { status: 502 }
    );
  }
}
