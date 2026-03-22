"use client";

import Link from "next/link";
import { useMemo } from "react";
import dayjs from "dayjs";
import { useAccessStore } from "@/stores/use-access-store";
import { useJournalStore } from "@/stores/use-journal-store";
import { useTemplateStore } from "@/stores/use-template-store";

function getActivityCopy(count: number) {
  if (count === 0) {
    return "아직 오늘 남긴 기록이 없습니다.";
  }

  if (count === 1) {
    return "오늘 기록 1개를 남겼습니다.";
  }

  return `오늘 기록 ${count}개를 남겼습니다.`;
}

function findJournalForSameMonthDay(
  journals: ReturnType<typeof useJournalStore.getState>["journals"],
  today: dayjs.Dayjs
) {
  return journals.find((journal) => {
    const createdAt = dayjs(journal.createdAt);

    return (
      createdAt.month() === today.month() &&
      createdAt.date() === today.date() &&
      !createdAt.isSame(today, "day")
    );
  });
}

function findJournalForExactDate(
  journals: ReturnType<typeof useJournalStore.getState>["journals"],
  targetDate: dayjs.Dayjs
) {
  return journals.find((journal) => dayjs(journal.createdAt).isSame(targetDate, "day"));
}

export function HomeDashboard() {
  const accessMode = useAccessStore((state) => state.accessMode);
  const loginAsMember = useAccessStore((state) => state.loginAsMember);
  const journals = useJournalStore((state) => state.journals);
  const templates = useTemplateStore((state) => state.templates);
  const recentTemplateIds = useTemplateStore((state) => state.recentTemplateIds);

  const today = dayjs();
  const todayJournals = useMemo(
    () => journals.filter((journal) => dayjs(journal.createdAt).isSame(today, "day")),
    [journals, today]
  );

  const recentJournals = useMemo(
    () =>
      [...journals]
        .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
        .slice(0, 4),
    [journals]
  );

  const revisitToday = useMemo(
    () => findJournalForSameMonthDay(recentJournals, today),
    [recentJournals, today]
  );

  const revisitWeekAgo = useMemo(
    () => findJournalForExactDate(recentJournals, today.subtract(7, "day")),
    [recentJournals, today]
  );

  const randomJournal = useMemo(() => {
    if (recentJournals.length === 0) {
      return undefined;
    }

    const seed = today.date() % recentJournals.length;
    return recentJournals[seed];
  }, [recentJournals, today]);

  const recentTemplates = useMemo(
    () =>
      recentTemplateIds
        .map((id) => templates.find((template) => template.id === id))
        .filter((template): template is (typeof templates)[number] => Boolean(template))
        .slice(0, 4),
    [recentTemplateIds, templates]
  );

  const mostUsedTheme = useMemo(() => {
    const counts = journals.reduce<Record<string, number>>((acc, journal) => {
      acc[journal.theme] = (acc[journal.theme] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "없음";
  }, [journals]);

  if (accessMode === "guest") {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-8 text-ink">
        <section className="rounded-[32px] border border-line/10 bg-gradient-to-br from-sand/40 via-paper to-surface p-8 shadow-card md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-coral">
            Heeby
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight md:text-5xl">
            템플릿으로 시작하고, 생활 기능을 하나의 허브에 모으는 개인 앱
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-ink/72 md:text-lg">
            게스트 모드에서는 앱의 방향과 구조만 먼저 보여줍니다. 로그인 후에는
            기록, 템플릿, 그리고 앞으로 붙을 여행과 주식 기능까지 한곳에서 다룰
            수 있습니다.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loginAsMember}
              className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              일반 로그인 체험
            </button>
            <p className="self-center text-sm text-ink/60">
              어드민 모드는 로그인 후 헤더에서 추가 암호로 잠금 해제합니다.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-line/10 bg-surface p-5">
              <p className="text-sm font-semibold">기록</p>
              <p className="mt-2 text-sm leading-6 text-ink/62">
                템플릿 질문으로 부담 없이 시작하고, 저장 후에는 문서처럼 읽습니다.
              </p>
            </div>
            <div className="rounded-[24px] border border-line/10 bg-surface p-5">
              <p className="text-sm font-semibold">여행</p>
              <p className="mt-2 text-sm leading-6 text-ink/62">
                지도 기반 정리와 방문지 아카이브를 붙일 예정입니다.
              </p>
            </div>
            <div className="rounded-[24px] border border-line/10 bg-surface p-5">
              <p className="text-sm font-semibold">주식</p>
              <p className="mt-2 text-sm leading-6 text-ink/62">
                계좌, 시장, 섹터 메모를 생활 기록과 함께 관리합니다.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 text-ink">
      <section className="rounded-[32px] border border-line/10 bg-gradient-to-br from-sand/40 via-paper to-surface p-7 shadow-card md:p-9">
        <div className="grid gap-8 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-coral">
                Today Summary
              </p>
              <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">
                {today.format("YYYY년 MM월 DD일")}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink/72 md:text-lg">
                {getActivityCopy(todayJournals.length)} 빠르게 시작하고, 저장한 내용은
                다시 읽기 좋은 문서처럼 남겨두세요.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Link
                href="/journals/new"
                className="rounded-[24px] border border-coral/15 bg-coral px-5 py-5 text-white transition hover:opacity-92"
              >
                <p className="text-sm font-semibold">새 기록 작성</p>
                <p className="mt-2 text-sm text-white/82">
                  템플릿을 고르고 바로 시작
                </p>
              </Link>
              <Link
                href="/templates/new"
                className="rounded-[24px] border border-line/10 bg-surface px-5 py-5 transition hover:border-coral/35 hover:bg-soft"
              >
                <p className="text-sm font-semibold">템플릿 만들기</p>
                <p className="mt-2 text-sm text-ink/62">새 질문 구조 추가</p>
              </Link>
              <div className="rounded-[24px] border border-line/10 bg-surface px-5 py-5">
                <p className="text-sm font-semibold">여행 추가</p>
                <p className="mt-2 text-sm text-ink/62">곧 연결될 위젯 진입점</p>
              </div>
              <div className="rounded-[24px] border border-line/10 bg-surface px-5 py-5">
                <p className="text-sm font-semibold">주식 기록</p>
                <p className="mt-2 text-sm text-ink/62">곧 연결될 요약 모듈</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
              <p className="text-sm font-semibold text-coral">상태</p>
              <dl className="mt-5 grid gap-4 text-sm">
                <div>
                  <dt className="text-ink/55">전체 기록</dt>
                  <dd className="mt-1 text-2xl font-bold">{journals.length}</dd>
                </div>
                <div>
                  <dt className="text-ink/55">템플릿 수</dt>
                  <dd className="mt-1 text-2xl font-bold">{templates.length}</dd>
                </div>
                <div>
                  <dt className="text-ink/55">가장 많이 쓴 주제</dt>
                  <dd className="mt-1 text-lg font-semibold">{mostUsedTheme}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
              <p className="text-sm font-semibold text-coral">한 줄 메모</p>
              <p className="mt-4 text-sm leading-6 text-ink/68">
                지금 홈은 전체 생활 기능을 연결하는 허브로 재구성되는 중입니다.
                기록 흐름은 유지하고, 여행과 주식 같은 기능은 위젯 단위로
                붙여나가는 방향이 맞습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[30px] border border-line/10 bg-surface p-6 shadow-card md:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
                Recent Journals
              </p>
              <h2 className="mt-2 text-2xl font-bold">최근 기록</h2>
            </div>
            <Link
              href="/journals"
              className="rounded-full border border-line/10 bg-paper px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
            >
              전체 보기
            </Link>
          </div>

          <div className="mt-6 grid gap-4">
            {recentJournals.map((journal) => (
              <Link
                key={journal.id}
                href={`/journals/${journal.id}`}
                className="rounded-[24px] border border-line/10 bg-paper p-5 transition hover:border-coral/35 hover:bg-soft"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
                    {journal.theme}
                  </span>
                  <span className="text-xs text-ink/48">
                    {dayjs(journal.createdAt).format("MM.DD")}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{journal.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/62">
                  {journal.answers.map((item) => item.answer).join(" ")}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <section className="rounded-[30px] border border-line/10 bg-surface p-6 shadow-card md:p-7">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
                Revisit
              </p>
              <h2 className="mt-2 text-2xl font-bold">다시 보기</h2>
            </div>

            <div className="mt-6 grid gap-3">
              <RevisitCard
                title="오늘의 과거 기록"
                description="같은 월/일에 남긴 기록이 있으면 다시 꺼내봅니다."
                journal={revisitToday}
                emptyText="같은 날짜에 남긴 과거 기록이 아직 없습니다."
              />
              <RevisitCard
                title="1주 전 기록"
                description={`${today.subtract(7, "day").format("MM월 DD일")}에 남긴 기록입니다.`}
                journal={revisitWeekAgo}
                emptyText="정확히 1주 전 날짜의 기록이 없습니다."
              />
              <RevisitCard
                title="랜덤 기록"
                description="가볍게 다시 읽어볼 기록 하나를 추천합니다."
                journal={randomJournal}
                emptyText="추천할 기록이 아직 없습니다."
              />
            </div>
          </section>

          <section className="rounded-[30px] border border-line/10 bg-surface p-6 shadow-card md:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
                  Recent Templates
                </p>
                <h2 className="mt-2 text-2xl font-bold">최근 템플릿</h2>
              </div>
              <Link
                href="/templates"
                className="rounded-full border border-line/10 bg-paper px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
              >
                전체 보기
              </Link>
            </div>

            <div className="mt-6 grid gap-3">
              {recentTemplates.map((template) => (
                <Link
                  key={template.id}
                  href="/journals/new"
                  className="rounded-[24px] border border-line/10 bg-paper p-4 transition hover:border-coral/35 hover:bg-soft"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{template.name}</p>
                    <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
                      {template.theme}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-ink/60">
                    질문 {template.questions.length}개
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[30px] border border-dashed border-line/20 bg-surface p-6 shadow-card">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
                Travel Widget
              </p>
              <h3 className="mt-2 text-xl font-bold">여행 모듈 자리</h3>
              <p className="mt-3 text-sm leading-6 text-ink/62">
                지도 기반 방문지 정리와 최근 장소 미리보기를 붙일 예정입니다.
              </p>
            </div>

            <div className="rounded-[30px] border border-dashed border-line/20 bg-surface p-6 shadow-card">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
                Stock Widget
              </p>
              <h3 className="mt-2 text-xl font-bold">주식 모듈 자리</h3>
              <p className="mt-3 text-sm leading-6 text-ink/62">
                계좌 변화, 시장 요약, 섹터 메모를 위젯형으로 연결할 예정입니다.
              </p>
            </div>
          </section>

          {accessMode === "admin" ? (
            <section className="rounded-[30px] border border-line/10 bg-surface p-6 shadow-card md:p-7">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
                Admin Layer
              </p>
              <h2 className="mt-2 text-2xl font-bold">어드민 전용 자리</h2>
              <div className="mt-5 grid gap-3 text-sm leading-6 text-ink/64">
                <p>실험 기능 토글, 데이터 점검, 내부 메모 같은 운영성 도구를 이 영역에 붙일 수 있습니다.</p>
                <p>현재는 노출 정책과 레이아웃 구조만 먼저 반영한 상태입니다.</p>
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  );
}

type RevisitCardProps = {
  title: string;
  description: string;
  journal?: ReturnType<typeof useJournalStore.getState>["journals"][number];
  emptyText: string;
};

function RevisitCard({
  title,
  description,
  journal,
  emptyText
}: RevisitCardProps) {
  if (!journal) {
    return (
      <div className="rounded-[24px] border border-dashed border-line/20 bg-paper p-4">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs text-ink/54">{description}</p>
        <p className="mt-3 text-sm leading-6 text-ink/62">{emptyText}</p>
      </div>
    );
  }

  return (
    <Link
      href={`/journals/${journal.id}`}
      className="rounded-[24px] border border-line/10 bg-paper p-4 transition hover:border-coral/35 hover:bg-soft"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs text-ink/54">{description}</p>
        </div>
        <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
          {journal.theme}
        </span>
      </div>
      <h3 className="mt-4 text-base font-semibold">{journal.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/62">
        {journal.answers.map((item) => item.answer).join(" ")}
      </p>
    </Link>
  );
}
