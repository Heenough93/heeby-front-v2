import type { TravelTrip } from "@/features/travel/lib/travel-types";

export const travelTrips: TravelTrip[] = [
  {
    id: "trip-east-asia-2023",
    name: "2023 동아시아 이동",
    visibility: "private",
    note: "서울에서 출발해 도쿄와 싱가포르까지 이어진 짧은 이동 기록.",
    createdAt: "2023-02-20T09:00:00.000Z",
    updatedAt: "2023-07-20T09:00:00.000Z"
  },
  {
    id: "trip-europe-2024",
    name: "2024 파리 체류",
    visibility: "public",
    note: "도시 산책과 박물관 중심 일정으로 묶은 첫 공개 여행.",
    createdAt: "2024-04-01T09:00:00.000Z",
    updatedAt: "2024-05-17T09:00:00.000Z"
  },
  {
    id: "trip-usa-2024",
    name: "2024 뉴욕 워크로그",
    visibility: "private",
    note: "걷는 동선과 지역별 메모를 다시 보기 좋게 남긴 일정.",
    createdAt: "2024-09-01T09:00:00.000Z",
    updatedAt: "2024-10-08T09:00:00.000Z"
  }
];
