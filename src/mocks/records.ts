import { nanoid } from "nanoid";
import type { JournalRecord } from "@/types/domain";
import { templates } from "@/mocks/templates";

const now = "2026-03-21T09:00:00.000Z";

export const records: JournalRecord[] = [
  {
    id: nanoid(),
    title: "React Query 학습 메모",
    theme: "개발",
    templateId: templates[0].id,
    answers: [
      { question: "오늘 한 작업", answer: "queryClient와 provider 구조 정리" },
      { question: "막힌 문제", answer: "캐시 경계와 staleTime 이해 부족" },
      { question: "해결 방법", answer: "공식 문서와 예제를 비교해 정리" },
      { question: "배운 점", answer: "서버 상태와 UI 상태는 분리해야 한다" }
    ],
    createdAt: now,
    updatedAt: now
  }
];
