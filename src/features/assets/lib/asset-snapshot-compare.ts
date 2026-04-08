import type { AssetSnapshotItem } from "@/features/assets/lib/asset-snapshot-types";
import { getAssetSnapshotComparisonKey } from "@/features/assets/lib/asset-snapshot-utils";

export type AssetSnapshotChange =
  | { type: "same"; label: "유지" }
  | { type: "new"; label: "NEW" }
  | { type: "up"; delta: number; label: string }
  | { type: "down"; delta: number; label: string };

export function getAssetSnapshotChanges(params: {
  currentItems: AssetSnapshotItem[];
  previousItems?: AssetSnapshotItem[];
}) {
  const previousAmountByKey = new Map(
    (params.previousItems ?? []).map((item) => [
      getAssetSnapshotComparisonKey(item),
      item.amount
    ])
  );

  return params.currentItems.map((item) => {
    const previousAmount = previousAmountByKey.get(getAssetSnapshotComparisonKey(item));

    let change: AssetSnapshotChange;

    if (previousAmount === undefined) {
      change = { type: "new", label: "NEW" };
    } else if (previousAmount === item.amount) {
      change = { type: "same", label: "유지" };
    } else if (previousAmount < item.amount) {
      change = {
        type: "up",
        delta: item.amount - previousAmount,
        label: `+${Math.round(item.amount - previousAmount).toLocaleString("ko-KR")}원`
      };
    } else {
      change = {
        type: "down",
        delta: previousAmount - item.amount,
        label: `-${Math.round(previousAmount - item.amount).toLocaleString("ko-KR")}원`
      };
    }

    return {
      item,
      previousAmount,
      change
    };
  });
}

export function getAssetSnapshotOuts(params: {
  currentItems: AssetSnapshotItem[];
  previousItems?: AssetSnapshotItem[];
}) {
  const currentKeys = new Set(
    params.currentItems.map((item) => getAssetSnapshotComparisonKey(item))
  );

  return (params.previousItems ?? []).filter(
    (item) => !currentKeys.has(getAssetSnapshotComparisonKey(item))
  );
}
