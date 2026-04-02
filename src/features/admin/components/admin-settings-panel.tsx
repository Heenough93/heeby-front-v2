"use client";

import { useMemo, useState } from "react";
import { AlertDialog } from "@/shared/components/feedback/alert-dialog";
import {
  useAnnouncementStore,
  type AnnouncementDraft,
  type AnnouncementDismissMode
} from "@/stores/ui/use-announcement-store";
import {
  useFeatureFlagStore,
  type FeatureFlagKey
} from "@/stores/app/use-feature-flag-store";
import { useJournalTemplateStore } from "@/features/journal-templates/store/journal-template-store";
import { useJournalStore } from "@/features/journals/store/journal-store";
import { useRoutineStore } from "@/features/routines/store/routine-store";
import { useTravelStore } from "@/features/travel/store/travel-store";
import { useToastStore } from "@/stores/ui/use-toast-store";

const featureFlagItems: Array<{
  key: FeatureFlagKey;
  label: string;
  description: string;
}> = [
  {
    key: "showTravelWidget",
    label: "여행 위젯 표시",
    description: "홈에서 세계지도 기반 여행 위젯을 노출합니다."
  },
  {
    key: "showStockWidget",
    label: "주식 위젯 표시",
    description: "홈에서 주식 placeholder 또는 추후 주식 위젯을 노출합니다."
  }
];

const createEmptyAnnouncementDraft = (): AnnouncementDraft => ({
  title: "",
  description: "",
  primaryActionLabel: "",
  primaryActionHref: "",
  dismissMode: "hide-for-today",
  isActive: true,
  priority: 50
});

export function AdminSettingsPanel() {
  const journals = useJournalStore((state) => state.journals);
  const journalTemplates = useJournalTemplateStore(
    (state) => state.journalTemplates
  );
  const routines = useRoutineStore((state) => state.routines);
  const travelTrips = useTravelStore((state) => state.trips);
  const travelVisits = useTravelStore((state) => state.visits);
  const announcements = useAnnouncementStore((state) => state.announcements);
  const upsertAnnouncement = useAnnouncementStore(
    (state) => state.upsertAnnouncement
  );
  const removeAnnouncement = useAnnouncementStore((state) => state.removeAnnouncement);
  const resetAnnouncements = useAnnouncementStore(
    (state) => state.resetAnnouncements
  );
  const resetJournals = useJournalStore((state) => state.resetJournals);
  const resetJournalTemplates = useJournalTemplateStore(
    (state) => state.resetJournalTemplates
  );
  const resetTravelVisits = useTravelStore((state) => state.resetVisits);
  const flags = useFeatureFlagStore((state) => state.flags);
  const toggleFlag = useFeatureFlagStore((state) => state.toggleFlag);
  const resetFlags = useFeatureFlagStore((state) => state.resetFlags);
  const showToast = useToastStore((state) => state.showToast);
  const sortedAnnouncements = useMemo(
    () => [...announcements].sort((a, b) => b.priority - a.priority),
    [announcements]
  );
  const [lastAction, setLastAction] = useState("");
  const [pendingAction, setPendingAction] = useState<
    "reset-journals" | "reset-templates" | "reset-all" | "reset-announcements" | null
  >(null);
  const [pendingFlagKey, setPendingFlagKey] = useState<FeatureFlagKey | null>(null);
  const [pendingAnnouncementDeleteId, setPendingAnnouncementDeleteId] = useState<
    string | null
  >(null);
  const [isResetFlagsDialogOpen, setIsResetFlagsDialogOpen] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(
    sortedAnnouncements[0]?.id ?? null
  );
  const [draft, setDraft] = useState<AnnouncementDraft>(createEmptyAnnouncementDraft());

  const selectedAnnouncement =
    sortedAnnouncements.find((item) => item.id === editingAnnouncementId) ?? null;

  const loadAnnouncementDraft = (announcementId: string | null) => {
    const nextAnnouncement =
      sortedAnnouncements.find((item) => item.id === announcementId) ?? null;

    if (!nextAnnouncement) {
      setEditingAnnouncementId(null);
      setDraft(createEmptyAnnouncementDraft());
      return;
    }

    setEditingAnnouncementId(nextAnnouncement.id);
    setDraft({
      title: nextAnnouncement.title,
      description: nextAnnouncement.description,
      primaryActionLabel: nextAnnouncement.primaryActionLabel ?? "",
      primaryActionHref: nextAnnouncement.primaryActionHref ?? "",
      dismissMode: nextAnnouncement.dismissMode,
      isActive: nextAnnouncement.isActive,
      priority: nextAnnouncement.priority
    });
  };

  const handleDraftChange = <K extends keyof AnnouncementDraft>(
    key: K,
    value: AnnouncementDraft[K]
  ) => {
    setDraft((current) => ({
      ...current,
      [key]: value
    }));
  };

  const handleAnnouncementSubmit = () => {
    const primaryActionLabel = draft.primaryActionLabel?.trim() ?? "";
    const primaryActionHref = draft.primaryActionHref?.trim() ?? "";

    if (!draft.title.trim() || !draft.description.trim()) {
      showToast({
        title: "공지 제목과 설명을 입력해 주세요.",
        variant: "error"
      });
      return;
    }

    if (
      (primaryActionLabel && !primaryActionHref) ||
      (!primaryActionLabel && primaryActionHref)
    ) {
      showToast({
        title: "버튼 문구와 이동 경로는 함께 입력해 주세요.",
        variant: "error"
      });
      return;
    }

    const isEditing = Boolean(editingAnnouncementId);

    upsertAnnouncement({
      ...(editingAnnouncementId ? { id: editingAnnouncementId } : {}),
      ...draft
    });

    setLastAction(
      isEditing
        ? `공지 "${draft.title.trim()}" 내용을 업데이트했습니다.`
        : `공지 "${draft.title.trim()}"를 추가했습니다.`
    );
    showToast({
      title: isEditing
        ? "공지를 수정했습니다."
        : "새 공지를 추가했습니다.",
      variant: "success"
    });

    if (!isEditing) {
      setDraft(createEmptyAnnouncementDraft());
    }
  };

  return (
    <section className="rounded-[30px] border border-line/10 bg-surface p-6 shadow-card md:p-7">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
        Admin Layer
      </p>
      <h2 className="mt-2 text-2xl font-bold">운영 설정 패널</h2>

      <div className="mt-5 grid gap-4 md:grid-cols-6">
        <div className="rounded-[24px] border border-line/10 bg-paper p-4">
          <p className="text-sm text-ink/55">현재 기록 수</p>
          <p className="mt-2 text-2xl font-bold">{journals.length}</p>
        </div>
        <div className="rounded-[24px] border border-line/10 bg-paper p-4">
          <p className="text-sm text-ink/55">현재 템플릿 수</p>
          <p className="mt-2 text-2xl font-bold">{journalTemplates.length}</p>
        </div>
        <div className="rounded-[24px] border border-line/10 bg-paper p-4">
          <p className="text-sm text-ink/55">현재 루틴 수</p>
          <p className="mt-2 text-2xl font-bold">{routines.length}</p>
        </div>
        <div className="rounded-[24px] border border-line/10 bg-paper p-4">
          <p className="text-sm text-ink/55">현재 여행 수</p>
          <p className="mt-2 text-2xl font-bold">{travelTrips.length}</p>
        </div>
        <div className="rounded-[24px] border border-line/10 bg-paper p-4">
          <p className="text-sm text-ink/55">현재 여행 방문지 수</p>
          <p className="mt-2 text-2xl font-bold">{travelVisits.length}</p>
        </div>
        <div className="rounded-[24px] border border-line/10 bg-paper p-4">
          <p className="text-sm text-ink/55">현재 상태</p>
          <p className="mt-2 text-base font-semibold">mock 기반 로컬 데이터</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <button
          type="button"
          onClick={() => setPendingAction("reset-journals")}
          className="rounded-[22px] border border-line/10 bg-paper px-4 py-4 text-left transition hover:border-coral/35 hover:bg-soft"
        >
          <p className="text-sm font-semibold">기록 초기화</p>
          <p className="mt-2 text-sm leading-6 text-ink/62">
            현재 브라우저에 저장된 기록 데이터를 mock 기본값으로 되돌립니다.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setPendingAction("reset-templates")}
          className="rounded-[22px] border border-line/10 bg-paper px-4 py-4 text-left transition hover:border-coral/35 hover:bg-soft"
        >
          <p className="text-sm font-semibold">템플릿 초기화</p>
          <p className="mt-2 text-sm leading-6 text-ink/62">
            최근 사용 템플릿 포함, 템플릿 데이터를 기본 상태로 되돌립니다.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setPendingAction("reset-all")}
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
            onClick={() => setIsResetFlagsDialogOpen(true)}
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
              onClick={() => setPendingFlagKey(item.key)}
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">공지 모달 관리</p>
            <p className="mt-2 text-sm leading-6 text-ink/62">
              첫 진입 시 노출할 공지 문구, 우선순위, 버튼, 닫기 옵션을 관리합니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingAnnouncementId(null);
                setDraft(createEmptyAnnouncementDraft());
              }}
              className="rounded-full border border-line/10 bg-surface px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
            >
              새 공지
            </button>
            <button
              type="button"
              onClick={() => setPendingAction("reset-announcements")}
              className="rounded-full border border-line/10 bg-surface px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
            >
              기본값 복원
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="grid gap-3">
            {sortedAnnouncements.length ? (
              sortedAnnouncements.map((announcement) => (
                <button
                  key={announcement.id}
                  type="button"
                  onClick={() => loadAnnouncementDraft(announcement.id)}
                  className={`rounded-[22px] border px-4 py-4 text-left transition ${
                    editingAnnouncementId === announcement.id
                      ? "border-coral/35 bg-coral/10"
                      : "border-line/10 bg-surface hover:border-coral/35 hover:bg-soft"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{announcement.title}</p>
                    <span
                      className={
                        announcement.isActive
                          ? "rounded-full bg-coral px-3 py-1 text-xs font-semibold text-white"
                          : "rounded-full bg-soft px-3 py-1 text-xs font-semibold text-ink/68"
                      }
                    >
                      {announcement.isActive ? "활성" : "비활성"}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/62">
                    {announcement.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink/55">
                    <span>우선순위 {announcement.priority}</span>
                    <span>
                      {announcement.dismissMode === "hide-for-today"
                        ? "오늘 하루 숨김"
                        : "닫기만 허용"}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-[22px] border border-dashed border-line/20 bg-surface px-4 py-5 text-sm leading-6 text-ink/58">
                등록된 공지가 없습니다. 새 공지를 만들어 첫 진입 모달을 추가해 보세요.
              </div>
            )}
          </div>

          <div className="rounded-[22px] border border-line/10 bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">
                  {selectedAnnouncement ? "공지 수정" : "새 공지 작성"}
                </p>
                <p className="mt-2 text-sm leading-6 text-ink/62">
                  홈 진입 시 가장 우선순위가 높은 활성 공지가 먼저 표시됩니다.
                </p>
              </div>
              {selectedAnnouncement ? (
                <button
                  type="button"
                  onClick={() => setPendingAnnouncementDeleteId(selectedAnnouncement.id)}
                  className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300"
                >
                  삭제
                </button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm">
                <span className="font-semibold">공지 제목</span>
                <input
                  value={draft.title}
                  onChange={(event) => handleDraftChange("title", event.target.value)}
                  className="rounded-[18px] border border-line/10 bg-paper px-4 py-3 outline-none transition placeholder:text-ink/35 focus:border-coral/35"
                  placeholder="예: 이번 주 홈 실험 기능이 열렸습니다."
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-semibold">공지 설명</span>
                <textarea
                  value={draft.description}
                  onChange={(event) =>
                    handleDraftChange("description", event.target.value)
                  }
                  rows={4}
                  className="rounded-[18px] border border-line/10 bg-paper px-4 py-3 outline-none transition placeholder:text-ink/35 focus:border-coral/35"
                  placeholder="공지 모달 본문에 표시할 설명을 입력합니다."
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  <span className="font-semibold">버튼 문구</span>
                  <input
                    value={draft.primaryActionLabel}
                    onChange={(event) =>
                      handleDraftChange("primaryActionLabel", event.target.value)
                    }
                    className="rounded-[18px] border border-line/10 bg-paper px-4 py-3 outline-none transition placeholder:text-ink/35 focus:border-coral/35"
                    placeholder="예: 새 기록 시작"
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="font-semibold">이동 경로</span>
                  <input
                    value={draft.primaryActionHref}
                    onChange={(event) =>
                      handleDraftChange("primaryActionHref", event.target.value)
                    }
                    className="rounded-[18px] border border-line/10 bg-paper px-4 py-3 outline-none transition placeholder:text-ink/35 focus:border-coral/35"
                    placeholder="예: /journals/new"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  <span className="font-semibold">닫기 옵션</span>
                  <select
                    value={draft.dismissMode}
                    onChange={(event) =>
                      handleDraftChange(
                        "dismissMode",
                        event.target.value as AnnouncementDismissMode
                      )
                    }
                    className="rounded-[18px] border border-line/10 bg-paper px-4 py-3 outline-none transition focus:border-coral/35"
                  >
                    <option value="hide-for-today">오늘 하루 보지 않기</option>
                    <option value="close-only">닫기만 허용</option>
                  </select>
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="font-semibold">우선순위</span>
                  <input
                    type="number"
                    min={0}
                    max={999}
                    value={draft.priority}
                    onChange={(event) =>
                      handleDraftChange(
                        "priority",
                        Number(event.target.value || 0)
                      )
                    }
                    className="rounded-[18px] border border-line/10 bg-paper px-4 py-3 outline-none transition focus:border-coral/35"
                  />
                </label>
              </div>

              <label className="flex items-center gap-3 rounded-[18px] border border-line/10 bg-paper px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={draft.isActive}
                  onChange={(event) =>
                    handleDraftChange("isActive", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-line/20 text-coral focus:ring-coral"
                />
                <span className="font-semibold">이 공지를 활성 상태로 노출</span>
              </label>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => loadAnnouncementDraft(editingAnnouncementId)}
                  className="rounded-full border border-line/10 bg-paper px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
                >
                  초기화
                </button>
                <button
                  type="button"
                  onClick={handleAnnouncementSubmit}
                  className="rounded-full bg-coral px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  {selectedAnnouncement ? "공지 저장" : "공지 추가"}
                </button>
              </div>
            </div>
          </div>
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

      <AlertDialog
        open={pendingAction === "reset-journals"}
        title="기록 데이터를 초기화할까요?"
        description="이 브라우저에 저장된 기록이 mock 기본값으로 되돌아갑니다."
        confirmLabel="기록 초기화"
        variant="danger"
        onClose={() => setPendingAction(null)}
        onConfirm={() => {
          resetJournals();
          setLastAction("기록 데이터를 초기 mock 상태로 되돌렸습니다.");
          showToast({
            title: "기록 데이터를 초기화했습니다.",
            variant: "success"
          });
          setPendingAction(null);
        }}
      />

      <AlertDialog
        open={pendingAction === "reset-templates"}
        title="템플릿 데이터를 초기화할까요?"
        description="템플릿과 최근 사용 템플릿 정보가 mock 기본값으로 되돌아갑니다."
        confirmLabel="템플릿 초기화"
        variant="danger"
        onClose={() => setPendingAction(null)}
        onConfirm={() => {
          resetJournalTemplates();
          setLastAction("템플릿 데이터를 초기 mock 상태로 되돌렸습니다.");
          showToast({
            title: "템플릿 데이터를 초기화했습니다.",
            variant: "success"
          });
          setPendingAction(null);
        }}
      />

      <AlertDialog
        open={pendingAction === "reset-all"}
        title="모든 로컬 데이터를 초기화할까요?"
        description="기록, 템플릿, 여행 방문지 데이터를 모두 mock 기본값으로 되돌립니다."
        confirmLabel="전체 초기화"
        variant="danger"
        onClose={() => setPendingAction(null)}
        onConfirm={() => {
          resetJournalTemplates();
          resetJournals();
          resetTravelVisits();
          setLastAction(
            "기록, 템플릿, 여행 방문지 데이터를 모두 초기 mock 상태로 되돌렸습니다."
          );
          showToast({
            title: "모든 로컬 데이터를 초기화했습니다.",
            variant: "success"
          });
          setPendingAction(null);
        }}
      />

      <AlertDialog
        open={pendingAction === "reset-announcements"}
        title="공지 모달을 기본값으로 복원할까요?"
        description="현재 등록된 공지 목록이 기본 welcome 공지 상태로 되돌아갑니다."
        confirmLabel="공지 기본값 복원"
        variant="danger"
        onClose={() => setPendingAction(null)}
        onConfirm={() => {
          resetAnnouncements();
          setLastAction("공지 모달 목록을 기본 상태로 되돌렸습니다.");
          showToast({
            title: "공지 모달 목록을 기본값으로 복원했습니다.",
            variant: "success"
          });
          loadAnnouncementDraft(null);
          setPendingAction(null);
        }}
      />

      <AlertDialog
        open={Boolean(pendingFlagKey)}
        title="실험 기능 토글을 변경할까요?"
        description={
          pendingFlagKey
            ? `${featureFlagItems.find((item) => item.key === pendingFlagKey)?.label} 설정을 ${
                flags[pendingFlagKey] ? "숨김" : "표시"
              } 상태로 변경합니다.`
            : ""
        }
        confirmLabel="변경 적용"
        onClose={() => setPendingFlagKey(null)}
        onConfirm={() => {
          if (!pendingFlagKey) {
            return;
          }

          const nextLabel = featureFlagItems.find(
            (item) => item.key === pendingFlagKey
          )?.label;
          const nextState = flags[pendingFlagKey] ? "OFF" : "ON";

          toggleFlag(pendingFlagKey);
          setLastAction(`${nextLabel} 설정을 ${nextState}로 변경했습니다.`);
          showToast({
            title: `${nextLabel} 설정을 ${nextState}로 변경했습니다.`,
            variant: "success"
          });
          setPendingFlagKey(null);
        }}
      />

      <AlertDialog
        open={Boolean(pendingAnnouncementDeleteId)}
        title="이 공지를 삭제할까요?"
        description="삭제한 공지는 첫 진입 모달에서 더 이상 노출되지 않습니다."
        confirmLabel="공지 삭제"
        variant="danger"
        onClose={() => setPendingAnnouncementDeleteId(null)}
        onConfirm={() => {
          if (!pendingAnnouncementDeleteId) {
            return;
          }

          const nextTitle = announcements.find(
            (item) => item.id === pendingAnnouncementDeleteId
          )?.title;

          removeAnnouncement(pendingAnnouncementDeleteId);
          setLastAction(`공지 "${nextTitle ?? ""}"를 삭제했습니다.`);
          showToast({
            title: "공지를 삭제했습니다.",
            variant: "success"
          });
          loadAnnouncementDraft(null);
          setPendingAnnouncementDeleteId(null);
        }}
      />

      <AlertDialog
        open={isResetFlagsDialogOpen}
        title="실험 기능 토글을 기본값으로 복원할까요?"
        description="여행 위젯과 주식 위젯 노출 설정이 기본 상태로 되돌아갑니다."
        confirmLabel="기본값 복원"
        variant="danger"
        onClose={() => setIsResetFlagsDialogOpen(false)}
        onConfirm={() => {
          resetFlags();
          setLastAction("실험 기능 토글을 기본값으로 되돌렸습니다.");
          showToast({
            title: "실험 기능 토글을 기본값으로 되돌렸습니다.",
            variant: "success"
          });
          setIsResetFlagsDialogOpen(false);
        }}
      />
    </section>
  );
}
