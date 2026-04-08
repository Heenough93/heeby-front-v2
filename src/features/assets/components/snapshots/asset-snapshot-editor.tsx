"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { getOwnerScopeLabel, ownerScopeValues, type OwnerScope } from "@/types/domain";
import { assetSnapshotDraftItemSchema } from "@/features/assets/lib/asset-snapshot-schema";
import type {
  AssetSnapshotDraftItem,
  AssetSnapshotEditorValues
} from "@/features/assets/lib/asset-snapshot-types";
import {
  cloneAssetDraftItem,
  createDefaultAssetSnapshotValues,
  getAssetSnapshotCategoryLabel,
  getAssetSnapshotMajorTypeLabel,
  moveItem
} from "@/features/assets/lib/asset-snapshot-utils";

type AssetSnapshotEditorProps = {
  value: AssetSnapshotEditorValues;
  onSubmit: (values: AssetSnapshotEditorValues) => void;
  submitLabel: string;
};

type ModalState = {
  open: boolean;
  values: AssetSnapshotDraftItem;
  error?: string;
};

export function AssetSnapshotEditor({
  value,
  onSubmit,
  submitLabel
}: AssetSnapshotEditorProps) {
  const [draft, setDraft] = useState<AssetSnapshotEditorValues>(value);
  const [formError, setFormError] = useState<string>();
  const [modal, setModal] = useState<ModalState>({
    open: false,
    values: cloneAssetDraftItem()
  });
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const sortedItems = useMemo(() => draft.items, [draft.items]);

  const openAddModal = () => {
    setModal({
      open: true,
      values: cloneAssetDraftItem(),
      error: undefined
    });
  };

  const closeModal = () => {
    setModal({
      open: false,
      values: cloneAssetDraftItem(),
      error: undefined
    });
  };

  const handleAddItem = () => {
    const parsed = assetSnapshotDraftItemSchema.safeParse(modal.values);

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

  const updateItem = <K extends keyof AssetSnapshotDraftItem>(
    itemId: string,
    key: K,
    value: AssetSnapshotDraftItem[K]
  ) => {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === itemId ? { ...item, [key]: value } : item
      )
    }));
  };

  const handleMoveItem = (itemId: string, direction: "up" | "down") => {
    const currentIndex = draft.items.findIndex((item) => item.id === itemId);
    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex === -1 || nextIndex < 0 || nextIndex >= draft.items.length) {
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
      setFormError("최소 1개 항목을 추가해주세요.");
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
                setDraft((current) => ({ ...current, title: event.target.value }))
              }
              className={inputClassName}
              placeholder="예: 2026-04 자산 스냅샷"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink/75">월</span>
            <input
              value={draft.monthKey}
              onChange={(event) =>
                setDraft((current) => ({ ...current, monthKey: event.target.value }))
              }
              className={inputClassName}
              placeholder="예: 2026-04"
            />
          </label>
        </div>

        <label className="mt-5 grid gap-2">
          <span className="text-sm font-semibold text-ink/75">한 줄 메모</span>
          <textarea
            value={draft.memo ?? ""}
            onChange={(event) =>
              setDraft((current) => ({ ...current, memo: event.target.value }))
            }
            rows={4}
            placeholder="이번 달 자산 구조를 한두 줄로 남깁니다."
            className={cn(inputClassName, "min-h-28 resize-y py-3")}
          />
        </label>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={openAddModal}
            className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            항목 추가
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(createDefaultAssetSnapshotValues());
              setFormError(undefined);
            }}
            className="rounded-full border border-line/10 bg-paper px-5 py-3 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
          >
            빈 리스트로 시작
          </button>
          <p className="text-sm text-ink/58">
            지난달 스냅샷을 복사한 뒤 금액만 수정해도 됩니다.
          </p>
        </div>
      </section>

      <section className="grid gap-4">
        {sortedItems.map((item, index) => (
          <article
            key={item.id}
            draggable
            onDragStart={() => setDraggedItemId(item.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDropItem(item.id)}
            className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-coral/10 text-sm font-semibold text-coral">
                  {index + 1}
                </div>
                <div className="grid gap-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/68">
                      {getOwnerScopeLabel(item.ownerScope)}
                    </span>
                    <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-ink/68">
                      {getAssetSnapshotMajorTypeLabel(item.majorType)}
                    </span>
                    <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-ink/68">
                      {getAssetSnapshotCategoryLabel(item.category)}
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Field label="대상">
                      <select
                        value={item.ownerScope}
                        onChange={(event) =>
                          updateItem(item.id, "ownerScope", event.target.value as OwnerScope)
                        }
                        className={inputClassName}
                      >
                        {ownerScopeValues.map((scope) => (
                          <option key={scope} value={scope}>
                            {getOwnerScopeLabel(scope)}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="대분류">
                      <select
                        value={item.majorType}
                        onChange={(event) =>
                          updateItem(item.id, "majorType", event.target.value as AssetSnapshotDraftItem["majorType"])
                        }
                        className={inputClassName}
                      >
                        <option value="deposit">예적금</option>
                        <option value="securities">증권</option>
                        <option value="insurance">보험</option>
                        <option value="other">기타</option>
                        <option value="cash">현금</option>
                      </select>
                    </Field>
                    <Field label="기관">
                      <input
                        value={item.institution}
                        onChange={(event) => updateItem(item.id, "institution", event.target.value)}
                        className={inputClassName}
                      />
                    </Field>
                    <Field label="라벨">
                      <input
                        value={item.label}
                        onChange={(event) => updateItem(item.id, "label", event.target.value)}
                        className={inputClassName}
                      />
                    </Field>
                    <Field label="카테고리">
                      <select
                        value={item.category}
                        onChange={(event) =>
                          updateItem(item.id, "category", event.target.value as AssetSnapshotDraftItem["category"])
                        }
                        className={inputClassName}
                      >
                        <option value="cash">현금</option>
                        <option value="invest">투자</option>
                        <option value="retirement">노후</option>
                      </select>
                    </Field>
                    <Field label="잔액">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={item.amount}
                        onChange={(event) => updateItem(item.id, "amount", event.target.value)}
                        className={inputClassName}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMoveItem(item.id, "up")}
                  className="rounded-full border border-line/10 bg-paper px-3 py-2 text-xs font-semibold transition hover:border-coral/35 hover:bg-soft"
                >
                  위로
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveItem(item.id, "down")}
                  className="rounded-full border border-line/10 bg-paper px-3 py-2 text-xs font-semibold transition hover:border-coral/35 hover:bg-soft"
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

        {sortedItems.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-line/15 bg-surface p-10 text-center shadow-card">
            <p className="text-lg font-semibold">아직 추가한 항목이 없습니다.</p>
            <p className="mt-2 text-sm text-ink/60">
              예적금, 증권, 보험, 현금 항목을 하나씩 추가해보세요.
            </p>
          </div>
        ) : null}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {formError ? <p className="text-sm font-medium text-rose-600">{formError}</p> : <span />}
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {submitLabel}
        </button>
      </div>

      {modal.open ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/35 px-5 py-6">
          <div className="mx-auto w-full max-w-5xl">
            <div className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold">자산 항목 추가</h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-line/10 bg-paper px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
                >
                  닫기
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="대상">
                  <select
                    value={modal.values.ownerScope}
                    onChange={(event) =>
                      setModal((current) => ({
                        ...current,
                        values: {
                          ...current.values,
                          ownerScope: event.target.value as OwnerScope
                        }
                      }))
                    }
                    className={inputClassName}
                  >
                    {ownerScopeValues.map((scope) => (
                      <option key={scope} value={scope}>
                        {getOwnerScopeLabel(scope)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="대분류">
                  <select
                    value={modal.values.majorType}
                    onChange={(event) =>
                      setModal((current) => ({
                        ...current,
                        values: {
                          ...current.values,
                          majorType: event.target.value as AssetSnapshotDraftItem["majorType"]
                        }
                      }))
                    }
                    className={inputClassName}
                  >
                    <option value="deposit">예적금</option>
                    <option value="securities">증권</option>
                    <option value="insurance">보험</option>
                    <option value="other">기타</option>
                    <option value="cash">현금</option>
                  </select>
                </Field>
                <Field label="카테고리">
                  <select
                    value={modal.values.category}
                    onChange={(event) =>
                      setModal((current) => ({
                        ...current,
                        values: {
                          ...current.values,
                          category: event.target.value as AssetSnapshotDraftItem["category"]
                        }
                      }))
                    }
                    className={inputClassName}
                  >
                    <option value="cash">현금</option>
                    <option value="invest">투자</option>
                    <option value="retirement">노후</option>
                  </select>
                </Field>
                <Field label="기관">
                  <input
                    value={modal.values.institution}
                    onChange={(event) =>
                      setModal((current) => ({
                        ...current,
                        values: {
                          ...current.values,
                          institution: event.target.value
                        }
                      }))
                    }
                    className={inputClassName}
                  />
                </Field>
                <Field label="라벨">
                  <input
                    value={modal.values.label}
                    onChange={(event) =>
                      setModal((current) => ({
                        ...current,
                        values: {
                          ...current.values,
                          label: event.target.value
                        }
                      }))
                    }
                    className={inputClassName}
                  />
                </Field>
                <Field label="잔액">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={modal.values.amount}
                    onChange={(event) =>
                      setModal((current) => ({
                        ...current,
                        values: {
                          ...current.values,
                          amount: event.target.value
                        }
                      }))
                    }
                    className={inputClassName}
                  />
                </Field>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                {modal.error ? (
                  <p className="text-sm font-medium text-rose-600">{modal.error}</p>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  항목 추가
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-ink/75">{label}</span>
      {children}
    </label>
  );
}

const inputClassName =
  "h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-surface";
