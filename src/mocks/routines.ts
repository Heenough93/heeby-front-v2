import type { Routine } from "@/features/routines/lib/routine-types";

export const routines: Routine[] = [
  {
    id: "routine-market-weekly",
    title: "주간 시총 점검",
    message: "이번 주 시총 순위 스냅샷을 작성하세요.",
    repeatType: "weekly",
    dayOfWeek: 0,
    time: "13:00",
    isActive: true,
    channel: "telegram",
    createdAt: "2026-03-20T09:00:00.000Z",
    updatedAt: "2026-03-20T09:00:00.000Z"
  },
  {
    id: "routine-workout-daily",
    title: "운동 기록 남기기",
    message: "오늘 운동 내용을 짧게라도 남겨보세요.",
    repeatType: "daily",
    time: "20:30",
    isActive: true,
    channel: "telegram",
    createdAt: "2026-03-21T09:00:00.000Z",
    updatedAt: "2026-03-21T09:00:00.000Z"
  },
  {
    id: "routine-review-monthly",
    title: "월간 회고 정리",
    message: "이번 달 회고 기록을 작성할 시간입니다.",
    repeatType: "monthly",
    dayOfMonth: 1,
    time: "21:00",
    isActive: false,
    channel: "telegram",
    createdAt: "2026-03-22T09:00:00.000Z",
    updatedAt: "2026-03-22T09:00:00.000Z"
  }
];
