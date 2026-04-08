import { describe, expect, it } from "vitest";
import {
  getAssetSnapshotChanges,
  getAssetSnapshotOuts
} from "@/features/assets/lib/asset-snapshot-compare";

describe("asset snapshot compare", () => {
  const previousItems = [
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
  ] as const;

  const currentItems = [
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
  ] as const;

  it("calculates new and changed amounts", () => {
    const changes = getAssetSnapshotChanges({
      currentItems: [...currentItems],
      previousItems: [...previousItems]
    });

    expect(changes[0]?.change.type).toBe("up");
    expect(changes[1]?.change.type).toBe("new");
  });

  it("finds removed items", () => {
    const outs = getAssetSnapshotOuts({
      currentItems: [...currentItems],
      previousItems: [...previousItems]
    });

    expect(outs).toHaveLength(1);
    expect(outs[0]?.label).toBe("국내주식");
  });
});
