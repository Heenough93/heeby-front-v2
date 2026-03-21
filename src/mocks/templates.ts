import { nanoid } from "nanoid";
import type { Template } from "@/types/domain";

const now = "2026-03-21T09:00:00.000Z";

export const templates: Template[] = [
  {
    id: nanoid(),
    name: "개발 회고",
    theme: "개발",
    questions: ["오늘 한 작업", "막힌 문제", "해결 방법", "배운 점"],
    createdAt: now,
    updatedAt: now
  },
  {
    id: nanoid(),
    name: "업무 회고",
    theme: "업무",
    questions: ["오늘 한 일", "잘된 점", "아쉬운 점", "다음 개선점"],
    createdAt: now,
    updatedAt: now
  },
  {
    id: nanoid(),
    name: "운동 기록",
    theme: "운동",
    questions: ["운동 종류", "강도와 느낌", "잘된 점", "다음 목표"],
    createdAt: now,
    updatedAt: now
  }
];
