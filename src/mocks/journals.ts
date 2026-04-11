import { nanoid } from "nanoid";
import type { Journal } from "@/features/journals/lib/journal-types";
import { journalTemplates } from "@/mocks/journal-templates";

export const journals: Journal[] = [
  {
    id: nanoid(),
    title: "React Query 학습 메모",
    theme: "개발",
    journalTemplateId: journalTemplates[0].id,
    journalTemplateNameSnapshot: journalTemplates[0].name,
    visibility: "private",
    answers: [
      { question: "오늘 한 작업", answer: "queryClient와 provider 구조 정리" },
      { question: "막힌 문제", answer: "캐시 경계와 staleTime 이해 부족" },
      { question: "해결 방법", answer: "공식 문서와 예제를 비교해 정리" },
      { question: "배운 점", answer: "서버 상태와 UI 상태는 분리해야 한다" }
    ],
    createdAt: "2026-03-21T09:00:00.000Z",
    updatedAt: "2026-03-21T09:00:00.000Z"
  },
  {
    id: nanoid(),
    title: "무한 스크롤 버그 복기",
    theme: "개발",
    journalTemplateId: journalTemplates[1].id,
    journalTemplateNameSnapshot: journalTemplates[1].name,
    visibility: "private",
    answers: [
      { question: "발생 증상", answer: "스크롤 하단에서 같은 요청이 반복 호출되었다." },
      { question: "원인 추정", answer: "observer disconnect 타이밍이 늦어서 중복 감지가 실패했다." },
      { question: "해결 과정", answer: "sentinel 조건을 재정리하고 pending 상태에서 observer를 끊었다." },
      { question: "재발 방지 포인트", answer: "intersection observer 사용 시 요청 상태 플래그를 반드시 분리한다." }
    ],
    createdAt: "2026-03-20T16:30:00.000Z",
    updatedAt: "2026-03-20T16:30:00.000Z"
  },
  {
    id: nanoid(),
    title: "타입 가드 정리",
    theme: "개발",
    journalTemplateId: journalTemplates[2].id,
    journalTemplateNameSnapshot: journalTemplates[2].name,
    visibility: "public",
    answers: [
      { question: "무엇을 학습했는지", answer: "TypeScript 사용자 정의 타입 가드와 narrowing 패턴을 정리했다." },
      { question: "핵심 개념", answer: "predicate 반환형과 discriminated union의 차이를 비교했다." },
      { question: "예제 적용", answer: "API 응답 파싱 로직에 타입 가드를 적용해 분기 로직을 줄였다." },
      { question: "다시 볼 포인트", answer: "zod와 타입 가드의 역할 분리를 더 명확히 할 필요가 있다." }
    ],
    createdAt: "2026-03-19T21:00:00.000Z",
    updatedAt: "2026-03-19T21:00:00.000Z"
  },
  {
    id: nanoid(),
    title: "주간 업무 회고",
    theme: "업무",
    journalTemplateId: journalTemplates[3].id,
    journalTemplateNameSnapshot: journalTemplates[3].name,
    visibility: "private",
    answers: [
      { question: "오늘 한 일", answer: "신규 기능 스펙 문서를 정리하고 일정 리스크를 공유했다." },
      { question: "잘된 점", answer: "기획과 개발 간 용어 불일치를 초반에 정리했다." },
      { question: "아쉬운 점", answer: "회의 전에 자료 공유가 늦어져 설명 시간이 길어졌다." },
      { question: "다음 개선점", answer: "회의 전날까지 핵심 안건을 문서로 정리해 전달한다." }
    ],
    createdAt: "2026-03-18T18:20:00.000Z",
    updatedAt: "2026-03-18T18:20:00.000Z"
  },
  {
    id: nanoid(),
    title: "프로젝트 킥오프 메모",
    theme: "업무",
    journalTemplateId: journalTemplates[4].id,
    journalTemplateNameSnapshot: journalTemplates[4].name,
    visibility: "private",
    answers: [
      { question: "회의 주제", answer: "Q2 프로젝트 킥오프 및 역할 분담" },
      { question: "핵심 논의", answer: "MVP 범위 축소와 일정 우선순위 재조정이 중심이었다." },
      { question: "결정 사항", answer: "첫 배포는 템플릿 기능과 기록 CRUD까지만 포함하기로 했다." },
      { question: "후속 액션", answer: "이번 주 내 와이어프레임 공유, 다음 주 초 API 계약 정리" }
    ],
    createdAt: "2026-03-17T10:00:00.000Z",
    updatedAt: "2026-03-17T10:00:00.000Z"
  },
  {
    id: nanoid(),
    title: "도쿄 2일차 기록",
    theme: "여행",
    journalTemplateId: journalTemplates[5].id,
    journalTemplateNameSnapshot: journalTemplates[5].name,
    visibility: "public",
    answers: [
      { question: "어디를 갔는지", answer: "시부야, 메이지신궁, 다이칸야마를 돌아다녔다." },
      { question: "좋았던 장소", answer: "다이칸야마의 작은 서점과 골목 분위기가 특히 좋았다." },
      { question: "아쉬웠던 점", answer: "비가 와서 오래 걷지 못했고 사진도 많이 못 찍었다." },
      { question: "다시 가고 싶은지", answer: "날씨 좋은 계절에 다시 가고 싶다." }
    ],
    createdAt: "2026-03-16T20:10:00.000Z",
    updatedAt: "2026-03-16T20:10:00.000Z"
  },
  {
    id: nanoid(),
    title: "연남동 카페 메모",
    theme: "여행",
    journalTemplateId: journalTemplates[6].id,
    journalTemplateNameSnapshot: journalTemplates[6].name,
    visibility: "public",
    answers: [
      { question: "방문한 곳", answer: "연남동 골목에 있는 작은 로스터리 카페" },
      { question: "분위기", answer: "낮은 조도와 원목 인테리어라 차분하게 머물기 좋았다." },
      { question: "시그니처 메뉴", answer: "플랫화이트와 레몬 파운드 케이크 조합이 괜찮았다." },
      { question: "재방문 의사", answer: "사람 적은 평일 오전에 다시 가고 싶다." }
    ],
    createdAt: "2026-03-15T14:40:00.000Z",
    updatedAt: "2026-03-15T14:40:00.000Z"
  },
  {
    id: nanoid(),
    title: "반도체 섹터 관찰 노트",
    theme: "주식",
    journalTemplateId: journalTemplates[7].id,
    journalTemplateNameSnapshot: journalTemplates[7].name,
    visibility: "private",
    answers: [
      { question: "본 종목/섹터", answer: "반도체 장비주와 메모리 관련주 흐름을 체크했다." },
      { question: "왜 관심이 갔는지", answer: "실적 시즌을 앞두고 거래량이 늘고 있어서다." },
      { question: "리스크", answer: "단기 과열과 실적 기대 선반영 가능성이 있다." },
      { question: "다음 체크 포인트", answer: "가이던스 발표와 기관 수급 흐름을 같이 본다." }
    ],
    createdAt: "2026-03-14T22:15:00.000Z",
    updatedAt: "2026-03-14T22:15:00.000Z"
  },
  {
    id: nanoid(),
    title: "손절 복기",
    theme: "주식",
    journalTemplateId: journalTemplates[8].id,
    journalTemplateNameSnapshot: journalTemplates[8].name,
    visibility: "private",
    answers: [
      { question: "진입 근거", answer: "단기 반등 구간이라고 판단하고 분할 진입했다." },
      { question: "실행 결과", answer: "손절 기준을 늦게 적용해 손실 폭이 커졌다." },
      { question: "놓친 점", answer: "거래량 감소와 저항 구간을 과소평가했다." },
      { question: "다음 원칙", answer: "진입 전에 무조건 손절 가격과 이유를 적는다." }
    ],
    createdAt: "2026-03-13T09:20:00.000Z",
    updatedAt: "2026-03-13T09:20:00.000Z"
  },
  {
    id: nanoid(),
    title: "하체 운동 기록",
    theme: "운동",
    journalTemplateId: journalTemplates[9].id,
    journalTemplateNameSnapshot: journalTemplates[9].name,
    visibility: "private",
    answers: [
      { question: "운동 종류", answer: "스쿼트, 레그프레스, 런지 위주로 진행했다." },
      { question: "강도와 느낌", answer: "중량은 유지했고 마지막 세트에서 피로감이 컸다." },
      { question: "잘된 점", answer: "호흡과 자세를 끝까지 무너지지 않게 유지했다." },
      { question: "다음 목표", answer: "스쿼트 5kg 증량 전에 자세 영상을 다시 확인한다." }
    ],
    createdAt: "2026-03-12T07:10:00.000Z",
    updatedAt: "2026-03-12T07:10:00.000Z"
  },
  {
    id: nanoid(),
    title: "한강 10km 러닝 로그",
    theme: "운동",
    journalTemplateId: journalTemplates[10].id,
    journalTemplateNameSnapshot: journalTemplates[10].name,
    visibility: "public",
    answers: [
      { question: "코스", answer: "여의도 한강공원 왕복 코스" },
      { question: "거리와 페이스", answer: "10km, 평균 5분 42초 페이스" },
      { question: "몸 상태", answer: "초반은 가벼웠지만 후반 햄스트링이 조금 뻐근했다." },
      { question: "다음 목표", answer: "같은 거리에서 5분 35초 페이스 유지" }
    ],
    createdAt: "2026-03-11T06:30:00.000Z",
    updatedAt: "2026-03-11T06:30:00.000Z"
  }
];
