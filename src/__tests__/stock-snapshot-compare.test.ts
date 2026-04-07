import { describe, expect, it } from "vitest";
import {
  getStockSnapshotChanges,
  getStockSnapshotOuts
} from "@/features/stocks/lib/snapshots/stock-snapshot-compare";
import {
  stockSnapshotItems,
  stockSnapshots,
  stocks
} from "@/mocks/stocks";

describe("stock snapshot compare helpers", () => {
  it("marks moved and new ranks against the previous snapshot", () => {
    const previousSnapshot = stockSnapshots.find((snapshot) => snapshot.id === "snapshot-2026-w13");
    const currentSnapshot = stockSnapshots.find((snapshot) => snapshot.id === "snapshot-2026-w14");

    const changes = getStockSnapshotChanges({
      currentItems: stockSnapshotItems.filter((item) => item.snapshotId === currentSnapshot?.id),
      previousItems: stockSnapshotItems.filter((item) => item.snapshotId === previousSnapshot?.id),
      stocks
    });

    expect(changes[0]?.change.type).toBe("up");
    expect(changes[0]?.change.label).toBe("▲ 2");
    expect(changes[2]?.change.type).toBe("down");
  });

  it("reports removed items as OUT", () => {
    const previousSnapshot = stockSnapshots.find((snapshot) => snapshot.id === "snapshot-2026-w13");
    const currentSnapshot = stockSnapshots.find((snapshot) => snapshot.id === "snapshot-2026-w14");

    const outs = getStockSnapshotOuts({
      currentItems: stockSnapshotItems.filter((item) => item.snapshotId === currentSnapshot?.id),
      previousItems: stockSnapshotItems.filter((item) => item.snapshotId === previousSnapshot?.id),
      stocks
    });

    expect(outs).toHaveLength(1);
    expect(outs[0]?.stock?.ticker).toBe("TSLA");
  });
});
