"use client";

import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  assetSnapshotEditorSchema,
  type AssetSnapshotEditorSchemaValues
} from "@/features/assets/lib/asset-snapshot-schema";
import type {
  AssetSnapshot,
  AssetSnapshotDraftItem,
  AssetSnapshotEditorValues,
  AssetSnapshotItem
} from "@/features/assets/lib/asset-snapshot-types";
import {
  assetSnapshotItems as initialAssetSnapshotItems,
  assetSnapshots as initialAssetSnapshots
} from "@/mocks/asset-snapshots";

function sortSnapshots(snapshots: AssetSnapshot[]) {
  return [...snapshots].sort((a, b) => {
    if (a.monthKey === b.monthKey) {
      return dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf();
    }

    return a.monthKey < b.monthKey ? 1 : -1;
  });
}

type AssetStore = {
  snapshots: AssetSnapshot[];
  snapshotItems: AssetSnapshotItem[];
  addSnapshot: (values: AssetSnapshotEditorValues) => AssetSnapshot;
  updateSnapshot: (
    id: string,
    values: AssetSnapshotEditorValues
  ) => AssetSnapshot | undefined;
  getSnapshotById: (id: string) => AssetSnapshot | undefined;
  getSnapshotItems: (snapshotId: string) => AssetSnapshotItem[];
  getLatestSnapshot: () => AssetSnapshot | undefined;
  removeSnapshot: (id: string) => void;
  getDraftItemById: (snapshotId: string, itemId: string) => AssetSnapshotDraftItem | undefined;
  resetAssets: () => void;
};

function buildSnapshotPayload(
  values: AssetSnapshotEditorValues,
  currentSnapshot?: AssetSnapshot
) {
  const parsedValues = assetSnapshotEditorSchema.parse(values);
  const now = dayjs().toISOString();
  const nextSnapshot: AssetSnapshot = {
    id: currentSnapshot?.id ?? nanoid(),
    title: parsedValues.title.trim(),
    monthKey: parsedValues.monthKey.trim(),
    memo: parsedValues.memo?.trim() || undefined,
    sourceSnapshotId: parsedValues.sourceSnapshotId,
    createdAt: currentSnapshot?.createdAt ?? now,
    updatedAt: now
  };

  const nextItems: AssetSnapshotItem[] = parsedValues.items.map((item) => ({
    id: nanoid(),
    snapshotId: nextSnapshot.id,
    ownerScope: item.ownerScope,
    majorType: item.majorType,
    institution: item.institution.trim(),
    label: item.label.trim(),
    category: item.category,
    amount: Number(item.amount),
    createdAt: now,
    updatedAt: now
  }));

  return { nextSnapshot, nextItems };
}

export const useAssetStore = create<AssetStore>()(
  persist(
    (set, get) => ({
      snapshots: sortSnapshots(initialAssetSnapshots),
      snapshotItems: initialAssetSnapshotItems,
      addSnapshot: (values) => {
        const payload = buildSnapshotPayload(values);

        set((state) => ({
          snapshots: sortSnapshots([payload.nextSnapshot, ...state.snapshots]),
          snapshotItems: [...state.snapshotItems, ...payload.nextItems]
        }));

        return payload.nextSnapshot;
      },
      updateSnapshot: (id, values) => {
        const currentSnapshot = get().snapshots.find((snapshot) => snapshot.id === id);

        if (!currentSnapshot) {
          return undefined;
        }

        const payload = buildSnapshotPayload(values, currentSnapshot);

        set((state) => ({
          snapshots: sortSnapshots(
            state.snapshots.map((snapshot) =>
              snapshot.id === id ? payload.nextSnapshot : snapshot
            )
          ),
          snapshotItems: [
            ...state.snapshotItems.filter((item) => item.snapshotId !== id),
            ...payload.nextItems
          ]
        }));

        return payload.nextSnapshot;
      },
      getSnapshotById: (id) => get().snapshots.find((snapshot) => snapshot.id === id),
      getSnapshotItems: (snapshotId) =>
        get().snapshotItems.filter((item) => item.snapshotId === snapshotId),
      getLatestSnapshot: () => get().snapshots[0],
      removeSnapshot: (id) =>
        set((state) => ({
          snapshots: state.snapshots.filter((snapshot) => snapshot.id !== id),
          snapshotItems: state.snapshotItems.filter((item) => item.snapshotId !== id)
        })),
      getDraftItemById: (snapshotId, itemId) => {
        const item = get()
          .snapshotItems.find((candidate) => candidate.snapshotId === snapshotId && candidate.id === itemId);

        if (!item) {
          return undefined;
        }

        return {
          id: item.id,
          ownerScope: item.ownerScope,
          majorType: item.majorType,
          institution: item.institution,
          label: item.label,
          category: item.category,
          amount: String(item.amount)
        };
      },
      resetAssets: () =>
        set({
          snapshots: sortSnapshots(initialAssetSnapshots),
          snapshotItems: initialAssetSnapshotItems
        })
    }),
    {
      name: "heeby-asset-store",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState, version) => {
        if (!persistedState || typeof persistedState !== "object") {
          return {
            snapshots: sortSnapshots(initialAssetSnapshots),
            snapshotItems: initialAssetSnapshotItems
          };
        }

        if (version < 2) {
          return {
            ...persistedState,
            snapshots: sortSnapshots(initialAssetSnapshots),
            snapshotItems: initialAssetSnapshotItems
          };
        }

        return persistedState as AssetStore;
      }
    }
  )
);
