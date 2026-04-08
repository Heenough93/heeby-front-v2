import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { getOwnerScopeLabel, type OwnerScope } from "@/types/domain";
import type {
  AssetSnapshot,
  AssetSnapshotCategory,
  AssetSnapshotDraftItem,
  AssetSnapshotEditorValues,
  AssetSnapshotItem,
  AssetSnapshotMajorType
} from "@/features/assets/lib/asset-snapshot-types";

export function getAssetMonthKey(input = dayjs()) {
  return input.format("YYYY-MM");
}

export function formatAssetAmount(amount: number) {
  return `${Math.round(amount).toLocaleString("ko-KR")}원`;
}

export function getAssetSnapshotCategoryLabel(category: AssetSnapshotCategory) {
  switch (category) {
    case "cash":
      return "현금";
    case "invest":
      return "투자";
    case "retirement":
      return "노후";
  }
}

export function getAssetSnapshotMajorTypeLabel(majorType: AssetSnapshotMajorType) {
  switch (majorType) {
    case "deposit":
      return "예적금";
    case "securities":
      return "증권";
    case "insurance":
      return "보험";
    case "other":
      return "기타";
    case "cash":
      return "현금";
  }
}

export function formatAssetSnapshotUpdatedAt(updatedAt: string) {
  return dayjs(updatedAt).format("YYYY.MM.DD HH:mm");
}

export function createDefaultAssetSnapshotValues(): AssetSnapshotEditorValues {
  const monthKey = getAssetMonthKey();

  return {
    title: `${monthKey} 자산 스냅샷`,
    monthKey,
    memo: "",
    items: []
  };
}

export function cloneAssetDraftItem(
  item: Partial<AssetSnapshotDraftItem> = {}
): AssetSnapshotDraftItem {
  return {
    id: item.id ?? nanoid(),
    ownerScope: item.ownerScope ?? "yumja",
    majorType: item.majorType ?? "deposit",
    institution: item.institution ?? "",
    label: item.label ?? "",
    category: item.category ?? "cash",
    amount: item.amount ?? ""
  };
}

export function createDraftFromAssetSnapshot(params: {
  snapshot: AssetSnapshot;
  items: AssetSnapshotItem[];
}): AssetSnapshotEditorValues {
  return {
    title: params.snapshot.title,
    monthKey: params.snapshot.monthKey,
    memo: params.snapshot.memo ?? "",
    sourceSnapshotId: params.snapshot.sourceSnapshotId,
    items: [...params.items].map((item) =>
      cloneAssetDraftItem({
        id: item.id,
        ownerScope: item.ownerScope,
        majorType: item.majorType,
        institution: item.institution,
        label: item.label,
        category: item.category,
        amount: String(item.amount)
      })
    )
  };
}

export function createDraftFromLatestAssetSnapshot(params: {
  latestSnapshot?: AssetSnapshot;
  items: AssetSnapshotItem[];
}): AssetSnapshotEditorValues {
  const monthKey = getAssetMonthKey();

  if (!params.latestSnapshot) {
    return createDefaultAssetSnapshotValues();
  }

  return {
    title: `${monthKey} 자산 스냅샷`,
    monthKey,
    memo: "",
    sourceSnapshotId: params.latestSnapshot.id,
    items: params.items.map((item) =>
      cloneAssetDraftItem({
        ownerScope: item.ownerScope,
        majorType: item.majorType,
        institution: item.institution,
        label: item.label,
        category: item.category,
        amount: String(item.amount)
      })
    )
  };
}

export function createDraftFromSourceAssetSnapshot(params: {
  sourceSnapshot: AssetSnapshot;
  items: AssetSnapshotItem[];
}): AssetSnapshotEditorValues {
  return createDraftFromLatestAssetSnapshot({
    latestSnapshot: params.sourceSnapshot,
    items: params.items
  });
}

export function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
}

export function getAssetSnapshotComparisonKey(
  item: Pick<
    AssetSnapshotItem,
    "ownerScope" | "majorType" | "institution" | "label" | "category"
  >
) {
  return [
    item.ownerScope,
    item.majorType,
    item.institution.trim().toLowerCase(),
    item.label.trim().toLowerCase(),
    item.category
  ].join("::");
}

export function getAssetSnapshotOwnerTotals(items: AssetSnapshotItem[]) {
  return items.reduce<Record<OwnerScope, number>>(
    (acc, item) => {
      acc[item.ownerScope] += item.amount;
      return acc;
    },
    { yumja: 0, heeby: 0 }
  );
}

export function getAssetSnapshotCategoryBreakdown(items: AssetSnapshotItem[]) {
  return {
    yumja: {
      cash: items
        .filter((item) => item.ownerScope === "yumja" && item.category === "cash")
        .reduce((sum, item) => sum + item.amount, 0),
      invest: items
        .filter((item) => item.ownerScope === "yumja" && item.category === "invest")
        .reduce((sum, item) => sum + item.amount, 0),
      retirement: items
        .filter((item) => item.ownerScope === "yumja" && item.category === "retirement")
        .reduce((sum, item) => sum + item.amount, 0)
    },
    heeby: {
      cash: items
        .filter((item) => item.ownerScope === "heeby" && item.category === "cash")
        .reduce((sum, item) => sum + item.amount, 0),
      invest: items
        .filter((item) => item.ownerScope === "heeby" && item.category === "invest")
        .reduce((sum, item) => sum + item.amount, 0),
      retirement: items
        .filter((item) => item.ownerScope === "heeby" && item.category === "retirement")
        .reduce((sum, item) => sum + item.amount, 0)
    }
  };
}

export function getAssetSnapshotTotalAmount(items: AssetSnapshotItem[]) {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

export function getAssetSnapshotSummaryLabel(ownerScope: OwnerScope) {
  return `${getOwnerScopeLabel(ownerScope)} 총합`;
}
