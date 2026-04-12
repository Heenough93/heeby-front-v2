import { describe, expect, it } from "vitest";
import dayjs from "dayjs";
import {
  createStockSnapshotTitle,
  getStockSnapshotWeekOptions
} from "@/features/stocks/lib/snapshots/stock-snapshot-utils";

describe("stock snapshot utils", () => {
  it("creates the generated snapshot title from market scope and date", () => {
    const input = dayjs("2026-04-12T09:00:00.000Z");

    expect(createStockSnapshotTitle("KR", input)).toBe("한국시장 - 04월 12일");
    expect(createStockSnapshotTitle("US", input)).toBe("미국시장 - 04월 12일");
  });

  it("creates week select options around the current week", () => {
    const options = getStockSnapshotWeekOptions(dayjs("2026-04-12T09:00:00.000Z"));

    expect(options).toHaveLength(7);
    expect(options.map((option) => option.value)).toEqual([
      "2026-W11",
      "2026-W12",
      "2026-W13",
      "2026-W14",
      "2026-W15",
      "2026-W16",
      "2026-W17"
    ]);
    expect(options[4].label).toBe("2026-W15 (이번 주)");
  });
});
