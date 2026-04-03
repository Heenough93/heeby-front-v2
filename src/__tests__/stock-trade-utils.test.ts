import { describe, expect, it } from "vitest";
import {
  createEmptyTradeRow,
  getTradeAccountTypeLabel,
  getTradeAmount,
  getTradeMonthKey,
  getTradeSideLabel
} from "@/features/stocks/lib/stock-trade-utils";

describe("stock trade utils", () => {
  it("creates a blank draft row with defaults", () => {
    const row = createEmptyTradeRow("2026-04-03");

    expect(row.tradedAt).toBe("2026-04-03");
    expect(row.side).toBe("buy");
    expect(row.accountType).toBe("general");
  });

  it("derives month and amount labels", () => {
    expect(getTradeMonthKey("2026-04-03")).toBe("2026-04");
    expect(getTradeAmount({ quantity: 3, price: 100 })).toBe(300);
    expect(getTradeAccountTypeLabel("isa")).toBe("ISA");
    expect(getTradeSideLabel("sell")).toBe("매도");
  });
});
