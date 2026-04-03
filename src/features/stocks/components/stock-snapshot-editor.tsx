"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { stockSnapshotDraftItemSchema } from "@/features/stocks/lib/stock-snapshot-schema";
import {
  cloneDraftItem,
  createDefaultStockSnapshotValues,
  getStockMarketLabel,
  moveItem
} from "@/features/stocks/lib/stock-snapshot-utils";
import type {
  StockSnapshotDraftItem,
  StockSnapshotEditorValues
} from "@/features/stocks/lib/stock-types";

type StockSnapshotEditorProps = {
  value: StockSnapshotEditorValues;
  onSubmit: (values: StockSnapshotEditorValues) => void;
  submitLabel: string;
};

type ModalState = {
  open: boolean;
  values: StockSnapshotDraftItem;
  error?: string;
};

export function StockSnapshotEditor({
  value,
  onSubmit,
  submitLabel
}: StockSnapshotEditorProps) {
  const [draft, setDraft] = useState<StockSnapshotEditorValues>(value);
  const [formError, setFormError] = useState<string>();
  const [modal, setModal] = useState<ModalState>({
    open: false,
    values: cloneDraftItem()
  });
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const sortedItems = useMemo(() => draft.items, [draft.items]);

  const resetToBlank = () => {
    setDraft(createDefaultStockSnapshotValues());
    setFormError(undefined);
  };

  const openAddModal = () => {
    setModal({
      open: true,
      values: cloneDraftItem(),
      error: undefined
    });
  };

  const closeModal = () => {
    setModal({
      open: false,
      values: cloneDraftItem(),
      error: undefined
    });
  };

  const handleAddItem = () => {
    const parsed = stockSnapshotDraftItemSchema.safeParse(modal.values);

    if (!parsed.success) {
      setModal((current) => ({
        ...current,
        error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요."
      }));
      return;
    }

    setDraft((current) => ({
      ...current,
      items: [...current.items, parsed.data]
    }));
    closeModal();
  };

  const handleRemoveItem = (itemId: string) => {
    setDraft((current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== itemId)
    }));
  };

  const handleItemFieldChange = (
    itemId: string,
    key: "marketCap" | "price" | "note",
    nextValue: string
  ) => {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [key]: nextValue
            }
          : item
      )
    }));
  };

  const handleMoveItem = (itemId: string, direction: "up" | "down") => {
    const currentIndex = draft.items.findIndex((item) => item.id === itemId);

    if (currentIndex === -1) {
      return;
    }

    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (nextIndex < 0 || nextIndex >= draft.items.length) {
      return;
    }

    setDraft((current) => ({
      ...current,
      items: moveItem(current.items, currentIndex, nextIndex)
    }));
  };

  const handleDropItem = (targetItemId: string) => {
    if (!draggedItemId || draggedItemId === targetItemId) {
      return;
    }

    const fromIndex = draft.items.findIndex((item) => item.id === draggedItemId);
    const toIndex = draft.items.findIndex((item) => item.id === targetItemId);

    if (fromIndex === -1 || toIndex === -1) {
      return;
    }

    setDraft((current) => ({
      ...current,
      items: moveItem(current.items, fromIndex, toIndex)
    }));
    setDraggedItemId(null);
  };

  const handleSubmit = () => {
    if (draft.items.length === 0) {
      setFormError("최소 1개 종목을 추가해주세요.");
      return;
    }

    setFormError(undefined);
    onSubmit(draft);
  };

  return (
    <div className="grid gap-6">
      <section className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink/75">스냅샷 제목</span>
            <input
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  title: event.target.value
                }))
              }
              className={inputClassName}
              placeholder="예: 2026-W14 시총 스냅샷"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink/75">주차</span>
            <input
              value={draft.weekKey}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  weekKey: event.target.value
                }))
              }
              className={inputClassName}
              placeholder="예: 2026-W14"
            />
          </label>
        </div>

        <label className="mt-5 grid gap-2">
          <span className="text-sm font-semibold text-ink/75">이번 주 한 줄 총평</span>
          <textarea
            value={draft.comment ?? ""}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                comment: event.target.value
              }))
            }
            rows={4}
            placeholder="이번 주 순위를 이렇게 본 이유를 한두 줄로 남겨둡니다."
            className={cn(inputClassName, "min-h-28 resize-y py-3")}
          />
        </label>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={openAddModal}
            className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            종목 추가
          </button>
          <button
            type="button"
            onClick={resetToBlank}
            className="rounded-full border border-line/10 bg-paper px-5 py-3 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
          >
            빈 리스트로 시작
          </button>
          <p className="text-sm text-ink/58">
            지난 스냅샷을 복사한 뒤 순서를 드래그하거나 위아래 버튼으로 조정합니다.
          </p>
        </div>
      </section>

      <section className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
              Rank Editor
            </p>
            <h2 className="mt-2 text-2xl font-bold">이번 주 순위</h2>
          </div>
          <span className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink/68">
            종목 {sortedItems.length}개
          </span>
        </div>

        <div className="mt-6 grid gap-3">
          {sortedItems.map((item, index) => (
            <article
              key={item.id}
              draggable
              onDragStart={() => setDraggedItemId(item.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDropItem(item.id)}
              className="rounded-[24px] border border-line/10 bg-paper p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral/10 text-sm font-semibold text-coral">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold">{item.name}</p>
                      <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-ink/60">
                        {item.ticker.toUpperCase()}
                      </span>
                      <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-ink/60">
                        {getStockMarketLabel(item.market)}
                      </span>
                      {item.sector ? (
                        <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-ink/60">
                          {item.sector}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <label className="grid gap-1">
                        <span className="text-xs font-semibold text-ink/55">시가총액</span>
                        <input
                          value={item.marketCap ?? ""}
                          onChange={(event) =>
                            handleItemFieldChange(item.id, "marketCap", event.target.value)
                          }
                          className={inlineInputClassName}
                          placeholder="예: 2.8T"
                        />
                      </label>
                      <label className="grid gap-1">
                        <span className="text-xs font-semibold text-ink/55">현재가</span>
                        <input
                          value={item.price ?? ""}
                          onChange={(event) =>
                            handleItemFieldChange(item.id, "price", event.target.value)
                          }
                          className={inlineInputClassName}
                          placeholder="예: $973"
                        />
                      </label>
                    </div>
                    <label className="mt-3 grid gap-1">
                      <span className="text-xs font-semibold text-ink/55">메모</span>
                      <textarea
                        value={item.note ?? ""}
                        onChange={(event) =>
                          handleItemFieldChange(item.id, "note", event.target.value)
                        }
                        rows={3}
                        className={cn(inlineInputClassName, "min-h-24 resize-y py-3")}
                        placeholder="이번 주 순위에 반영한 관찰 포인트"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMoveItem(item.id, "up")}
                    className="rounded-full border border-line/10 bg-surface px-3 py-2 text-xs font-semibold transition hover:border-coral/35 hover:bg-soft"
                  >
                    위로
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveItem(item.id, "down")}
                    className="rounded-full border border-line/10 bg-surface px-3 py-2 text-xs font-semibold transition hover:border-coral/35 hover:bg-soft"
                  >
                    아래로
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {sortedItems.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-line/15 bg-paper p-8 text-center">
            <p className="text-lg font-semibold">아직 종목이 없습니다.</p>
            <p className="mt-2 text-sm text-ink/60">
              첫 종목을 추가한 뒤 순위를 정렬해 이번 주 스냅샷을 저장하세요.
            </p>
          </div>
        ) : null}

        {formError ? <p className="mt-5 text-sm text-red-600">{formError}</p> : null}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {submitLabel}
          </button>
        </div>
      </section>

      {modal.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 px-5">
          <div className="w-full max-w-2xl rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
                  Add Stock
                </p>
                <h2 className="mt-2 text-2xl font-bold">종목 추가</h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-line/10 bg-paper px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
              >
                닫기
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-ink/75">이름</span>
                <input
                  value={modal.values.name}
                  onChange={(event) =>
                    setModal((current) => ({
                      ...current,
                      values: {
                        ...current.values,
                        name: event.target.value
                      }
                    }))
                  }
                  className={inputClassName}
                  placeholder="예: NVIDIA"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-ink/75">티커</span>
                <input
                  value={modal.values.ticker}
                  onChange={(event) =>
                    setModal((current) => ({
                      ...current,
                      values: {
                        ...current.values,
                        ticker: event.target.value.toUpperCase()
                      }
                    }))
                  }
                  className={inputClassName}
                  placeholder="예: NVDA"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-ink/75">시장</span>
                <select
                  value={modal.values.market}
                  onChange={(event) =>
                    setModal((current) => ({
                      ...current,
                      values: {
                        ...current.values,
                        market: event.target.value as StockSnapshotDraftItem["market"]
                      }
                    }))
                  }
                  className={inputClassName}
                >
                  <option value="KR">국내</option>
                  <option value="US">미국</option>
                  <option value="ETF">ETF</option>
                  <option value="OTHER">기타</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-ink/75">산업</span>
                <input
                  value={modal.values.sector ?? ""}
                  onChange={(event) =>
                    setModal((current) => ({
                      ...current,
                      values: {
                        ...current.values,
                        sector: event.target.value
                      }
                    }))
                  }
                  className={inputClassName}
                  placeholder="예: 반도체"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-ink/75">시가총액</span>
                <input
                  value={modal.values.marketCap ?? ""}
                  onChange={(event) =>
                    setModal((current) => ({
                      ...current,
                      values: {
                        ...current.values,
                        marketCap: event.target.value
                      }
                    }))
                  }
                  className={inputClassName}
                  placeholder="예: 2.8T"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-ink/75">현재가</span>
                <input
                  value={modal.values.price ?? ""}
                  onChange={(event) =>
                    setModal((current) => ({
                      ...current,
                      values: {
                        ...current.values,
                        price: event.target.value
                      }
                    }))
                  }
                  className={inputClassName}
                  placeholder="예: $973"
                />
              </label>
            </div>

            <label className="mt-4 grid gap-2">
              <span className="text-sm font-semibold text-ink/75">한 줄 메모</span>
              <textarea
                value={modal.values.note ?? ""}
                onChange={(event) =>
                  setModal((current) => ({
                    ...current,
                    values: {
                      ...current.values,
                      note: event.target.value
                    }
                  }))
                }
                rows={4}
                className={cn(inputClassName, "min-h-28 resize-y py-3")}
                placeholder="이번 주 순위에 반영한 이유를 짧게 적어둡니다."
              />
            </label>

            {modal.error ? <p className="mt-4 text-sm text-red-600">{modal.error}</p> : null}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-line/10 bg-paper px-5 py-3 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleAddItem}
                className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                리스트에 추가
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const inputClassName =
  "h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-surface";

const inlineInputClassName =
  "rounded-2xl border border-line/10 bg-surface px-3 py-2 text-sm outline-none transition focus:border-coral focus:bg-paper";
