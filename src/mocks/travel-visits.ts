import type { TravelVisit } from "@/features/travel/lib/travel-types";

export const travelVisits: TravelVisit[] = [
  {
    id: "travel-seoul",
    tripId: "trip-east-asia-2023",
    city: "서울",
    country: "대한민국",
    latitude: 37.5665,
    longitude: 126.978,
    startedAt: "2023-03-18",
    endedAt: "2023-03-21",
    note: "출발 전 주말에 정비하고 바로 이동 동선을 정리했다.",
    createdAt: "2023-03-01T09:00:00.000Z",
    updatedAt: "2023-03-01T09:00:00.000Z"
  },
  {
    id: "travel-tokyo",
    tripId: "trip-east-asia-2023",
    city: "도쿄",
    country: "일본",
    latitude: 35.6762,
    longitude: 139.6503,
    startedAt: "2023-03-24",
    endedAt: "2023-03-27",
    note: "도심 이동 속도와 식당 메모를 남기기 좋았다.",
    createdAt: "2023-03-02T09:00:00.000Z",
    updatedAt: "2023-03-02T09:00:00.000Z"
  },
  {
    id: "travel-singapore",
    tripId: "trip-east-asia-2023",
    city: "싱가포르",
    country: "싱가포르",
    latitude: 1.3521,
    longitude: 103.8198,
    startedAt: "2023-08-08",
    endedAt: "2023-08-11",
    note: "짧은 일정이라 동선 압축이 핵심이었다.",
    createdAt: "2023-07-20T09:00:00.000Z",
    updatedAt: "2023-07-20T09:00:00.000Z"
  },
  {
    id: "travel-paris",
    tripId: "trip-europe-2024",
    city: "파리",
    country: "프랑스",
    latitude: 48.8566,
    longitude: 2.3522,
    startedAt: "2024-05-12",
    endedAt: "2024-05-17",
    note: "박물관과 동네 산책을 같이 넣는 일정이 잘 맞았다.",
    createdAt: "2024-04-15T09:00:00.000Z",
    updatedAt: "2024-04-15T09:00:00.000Z"
  },
  {
    id: "travel-newyork",
    tripId: "trip-usa-2024",
    city: "뉴욕",
    country: "미국",
    latitude: 40.7128,
    longitude: -74.006,
    startedAt: "2024-10-03",
    endedAt: "2024-10-08",
    note: "걷는 시간이 길어서 지역별 메모가 중요했다.",
    createdAt: "2024-09-18T09:00:00.000Z",
    updatedAt: "2024-09-18T09:00:00.000Z"
  }
];
