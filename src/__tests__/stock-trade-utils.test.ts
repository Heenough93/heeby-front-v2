import { describe, expect, it } from "vitest";
import {
  createEmptyTradeRow,
  formatTradeRate,
  getTradeAccountTypeLabel,
  getTradeBuyAmount,
  getTradeMonthKey,
  getTradePositionStatusLabel
} from "@/features/stocks/lib/trades/stock-trade-utils";

describe("stock trade utils", () => {
  it("creates a blank draft row with defaults", () => {
    const row = createEmptyTradeRow("2026-04-03");

    expect(row.tradedAt).toBe("2026-04-03");
    expect(row.positionStatus).toBe("open");
    expect(row.accountType).toBe("general");
  });

  it("derives month and amount labels", () => {
    expect(getTradeMonthKey("2026-04-03")).toBe("2026-04");
    expect(getTradeBuyAmount({ quantity: 3, buyPrice: 100 })).toBe(300);
    expect(getTradeAccountTypeLabel("isa")).toBe("ISA");
    expect(getTradePositionStatusLabel("closed")).toBe("매도완료");
    expect(formatTradeRate(12.345)).toBe("+12.35%");
  });
});
