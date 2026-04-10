import { describe, expect, it } from "vitest";
import {
  getAssetSnapshotChanges,
  getAssetSnapshotOuts
} from "@/features/assets/lib/asset-snapshot-compare";
import type { AssetSnapshotItem } from "@/features/assets/lib/asset-snapshot-types";

describe("asset snapshot compare", () => {
  const previousItems: AssetSnapshotItem[] = [
    {
      id: "1",
      snapshotId: "prev",
      ownerScope: "yumja",
      majorType: "deposit",
      institution: "카카오뱅크",
      label: "생활비",
      category: "cash",
      amount: 1000000,
      createdAt: "",
      updatedAt: ""
    },
    {
      id: "2",
      snapshotId: "prev",
      ownerScope: "heeby",
      majorType: "securities",
      institution: "미래에셋",
      label: "국내주식",
      category: "invest",
      amount: 2000000,
      createdAt: "",
      updatedAt: ""
    }
  ];

  const currentItems: AssetSnapshotItem[] = [
    {
      id: "3",
      snapshotId: "curr",
      ownerScope: "yumja",
      majorType: "deposit",
      institution: "카카오뱅크",
      label: "생활비",
      category: "cash",
      amount: 1300000,
      createdAt: "",
      updatedAt: ""
    },
    {
      id: "4",
      snapshotId: "curr",
      ownerScope: "heeby",
      majorType: "insurance",
      institution: "삼성생명",
      label: "연금",
      category: "retirement",
      amount: 4000000,
      createdAt: "",
      updatedAt: ""
    }
  ];

  it("calculates new and changed amounts", () => {
    const changes = getAssetSnapshotChanges({
      currentItems,
      previousItems
    });

    expect(changes[0]?.change.type).toBe("up");
    expect(changes[1]?.change.type).toBe("new");
  });

  it("keeps same amounts and detects down changes", () => {
    const changes = getAssetSnapshotChanges({
      currentItems: [
        {
          ...previousItems[0],
          id: "same",
          snapshotId: "curr"
        },
        {
          ...previousItems[1],
          id: "down",
          snapshotId: "curr",
          amount: 1500000
        }
      ],
      previousItems
    });

    expect(changes[0]?.change).toEqual({ type: "same", label: "유지" });
    expect(changes[1]?.change.type).toBe("down");
    expect(changes[1]?.change.label).toBe("-500,000원");
  });

  it("treats owner scope as part of the comparison key", () => {
    const changes = getAssetSnapshotChanges({
      currentItems: [
        {
          ...previousItems[0],
          id: "owner-scope",
          snapshotId: "curr",
          ownerScope: "heeby"
        }
      ],
      previousItems
    });

    expect(changes[0]?.change).toEqual({ type: "new", label: "NEW" });
  });

  it("marks every item as new when there is no previous snapshot", () => {
    const changes = getAssetSnapshotChanges({
      currentItems,
      previousItems: undefined
    });

    expect(changes.every((entry) => entry.change.type === "new")).toBe(true);
  });

  it("finds removed items", () => {
    const outs = getAssetSnapshotOuts({
      currentItems,
      previousItems
    });

    expect(outs).toHaveLength(1);
    expect(outs[0]?.label).toBe("국내주식");
  });

  it("returns no outs when there is no previous snapshot", () => {
    const outs = getAssetSnapshotOuts({
      currentItems,
      previousItems: undefined
    });

    expect(outs).toEqual([]);
  });
});
