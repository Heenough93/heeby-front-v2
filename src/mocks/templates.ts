import { nanoid } from "nanoid";
import type { Template } from "@/types/domain";

const timestamps = {
  t1: "2026-03-14T09:00:00.000Z",
  t2: "2026-03-15T09:30:00.000Z",
  t3: "2026-03-16T10:00:00.000Z",
  t4: "2026-03-17T07:40:00.000Z",
  t5: "2026-03-18T08:20:00.000Z",
  t6: "2026-03-19T11:10:00.000Z",
  t7: "2026-03-20T06:45:00.000Z",
  t8: "2026-03-21T09:00:00.000Z"
};

export const templates: Template[] = [
  {
    id: nanoid(),
    name: "개발 회고",
    theme: "개발",
    questions: ["오늘 한 작업", "막힌 문제", "해결 방법", "배운 점"],
    createdAt: timestamps.t1,
    updatedAt: timestamps.t8
  },
  {
    id: nanoid(),
    name: "버그 트래킹",
    theme: "개발",
    questions: ["발생 증상", "원인 추정", "해결 과정", "재발 방지 포인트"],
    createdAt: timestamps.t2,
    updatedAt: timestamps.t6
  },
  {
    id: nanoid(),
    name: "공부 노트",
    theme: "개발",
    questions: ["무엇을 학습했는지", "핵심 개념", "예제 적용", "다시 볼 포인트"],
    createdAt: timestamps.t3,
    updatedAt: timestamps.t7
  },
  {
    id: nanoid(),
    name: "업무 회고",
    theme: "업무",
    questions: ["오늘 한 일", "잘된 점", "아쉬운 점", "다음 개선점"],
    createdAt: timestamps.t1,
    updatedAt: timestamps.t5
  },
  {
    id: nanoid(),
    name: "회의 정리",
    theme: "업무",
    questions: ["회의 주제", "핵심 논의", "결정 사항", "후속 액션"],
    createdAt: timestamps.t4,
    updatedAt: timestamps.t8
  },
  {
    id: nanoid(),
    name: "여행 기록",
    theme: "여행",
    questions: ["어디를 갔는지", "좋았던 장소", "아쉬웠던 점", "다시 가고 싶은지"],
    createdAt: timestamps.t2,
    updatedAt: timestamps.t6
  },
  {
    id: nanoid(),
    name: "카페 탐방",
    theme: "여행",
    questions: ["방문한 곳", "분위기", "시그니처 메뉴", "재방문 의사"],
    createdAt: timestamps.t5,
    updatedAt: timestamps.t7
  },
  {
    id: nanoid(),
    name: "시장 관찰",
    theme: "주식",
    questions: ["본 종목/섹터", "왜 관심이 갔는지", "리스크", "다음 체크 포인트"],
    createdAt: timestamps.t3,
    updatedAt: timestamps.t8
  },
  {
    id: nanoid(),
    name: "매매 복기",
    theme: "주식",
    questions: ["진입 근거", "실행 결과", "놓친 점", "다음 원칙"],
    createdAt: timestamps.t4,
    updatedAt: timestamps.t6
  },
  {
    id: nanoid(),
    name: "운동 기록",
    theme: "운동",
    questions: ["운동 종류", "강도와 느낌", "잘된 점", "다음 목표"],
    createdAt: timestamps.t1,
    updatedAt: timestamps.t7
  },
  {
    id: nanoid(),
    name: "러닝 로그",
    theme: "운동",
    questions: ["코스", "거리와 페이스", "몸 상태", "다음 목표"],
    createdAt: timestamps.t5,
    updatedAt: timestamps.t8
  }
];
