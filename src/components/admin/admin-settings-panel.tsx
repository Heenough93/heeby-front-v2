"use client";

import { useState } from "react";
import {
  useFeatureFlagStore,
  type FeatureFlagKey
} from "@/stores/use-feature-flag-store";
import { useJournalStore } from "@/stores/use-journal-store";
import { useTemplateStore } from "@/stores/use-template-store";

const featureFlagItems: Array<{
  key: FeatureFlagKey;
  label: string;
  description: string;
}> = [
  {
    key: "showTravelWidget",
    label: "여행 위젯 표시",
    description: "홈에서 여행 placeholder 또는 추후 여행 위젯을 노출합니다."
  },
  {
    key: "showStockWidget",
    label: "주식 위젯 표시",
    description: "홈에서 주식 placeholder 또는 추후 주식 위젯을 노출합니다."
  }
];

export function AdminSettingsPanel() {
  const journals = useJournalStore((state) => state.journals);
  const templates = useTemplateStore((state) => state.templates);
  const resetJournals = useJournalStore((state) => state.resetJournals);
  const resetTemplates = useTemplateStore((state) => state.resetTemplates);
  const flags = useFeatureFlagStore((state) => state.flags);
  const toggleFlag = useFeatureFlagStore((state) => state.toggleFlag);
  const resetFlags = useFeatureFlagStore((state) => state.resetFlags);
  const [lastAction, setLastAction] = useState("");

  return (
    <section className="rounded-[30px] border border-line/10 bg-surface p-6 shadow-card md:p-7">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
        Admin Layer
      </p>
      <h2 className="mt-2 text-2xl font-bold">운영 설정 패널</h2>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-line/10 bg-paper p-4">
          <p className="text-sm text-ink/55">현재 기록 수</p>
          <p className="mt-2 text-2xl font-bold">{journals.length}</p>
        </div>
        <div className="rounded-[24px] border border-line/10 bg-paper p-4">
          <p className="text-sm text-ink/55">현재 템플릿 수</p>
          <p className="mt-2 text-2xl font-bold">{templates.length}</p>
        </div>
        <div className="rounded-[24px] border border-line/10 bg-paper p-4">
          <p className="text-sm text-ink/55">현재 상태</p>
          <p className="mt-2 text-base font-semibold">mock 기반 로컬 데이터</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <button
          type="button"
          onClick={() => {
            resetJournals();
            setLastAction("기록 데이터를 초기 mock 상태로 되돌렸습니다.");
          }}
          className="rounded-[22px] border border-line/10 bg-paper px-4 py-4 text-left transition hover:border-coral/35 hover:bg-soft"
        >
          <p className="text-sm font-semibold">기록 초기화</p>
          <p className="mt-2 text-sm leading-6 text-ink/62">
            현재 브라우저에 저장된 기록 데이터를 mock 기본값으로 되돌립니다.
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            resetTemplates();
            setLastAction("템플릿 데이터를 초기 mock 상태로 되돌렸습니다.");
          }}
          className="rounded-[22px] border border-line/10 bg-paper px-4 py-4 text-left transition hover:border-coral/35 hover:bg-soft"
        >
          <p className="text-sm font-semibold">템플릿 초기화</p>
          <p className="mt-2 text-sm leading-6 text-ink/62">
            최근 사용 템플릿 포함, 템플릿 데이터를 기본 상태로 되돌립니다.
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            resetTemplates();
            resetJournals();
            setLastAction("기록과 템플릿 데이터를 모두 초기 mock 상태로 되돌렸습니다.");
          }}
          className="rounded-[22px] border border-coral/20 bg-coral/10 px-4 py-4 text-left transition hover:border-coral/35 hover:bg-coral/15"
        >
          <p className="text-sm font-semibold text-coral">전체 초기화</p>
          <p className="mt-2 text-sm leading-6 text-ink/62">
            브라우저에 저장된 모든 로컬 데이터를 한 번에 초기 상태로 되돌립니다.
          </p>
        </button>
      </div>

      <div className="mt-6 rounded-[24px] border border-line/10 bg-paper p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">실험 기능 토글</p>
            <p className="mt-2 text-sm leading-6 text-ink/62">
              아직 정식으로 고정하지 않은 홈 구성 요소를 켜고 끕니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              resetFlags();
              setLastAction("실험 기능 토글을 기본값으로 되돌렸습니다.");
            }}
            className="rounded-full border border-line/10 bg-surface px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
          >
            기본값 복원
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          {featureFlagItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => toggleFlag(item.key)}
              className="flex items-start justify-between gap-4 rounded-[22px] border border-line/10 bg-surface px-4 py-4 text-left transition hover:border-coral/35 hover:bg-soft"
            >
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-ink/62">
                  {item.description}
                </p>
              </div>
              <span
                className={
                  flags[item.key]
                    ? "rounded-full bg-coral px-3 py-1 text-xs font-semibold text-white"
                    : "rounded-full bg-soft px-3 py-1 text-xs font-semibold text-ink/68"
                }
              >
                {flags[item.key] ? "ON" : "OFF"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-line/10 bg-paper p-4">
        <p className="text-sm font-semibold">운영 메모</p>
        <p className="mt-2 text-sm leading-6 text-ink/62">
          지금 어드민 영역은 실험 기능 토글, 데이터 점검, 테스트용 리셋 기능을
          모아두는 출발점입니다.
        </p>
        {lastAction ? (
          <p className="mt-3 text-sm font-medium text-coral">{lastAction}</p>
        ) : null}
      </div>
    </section>
  );
}
