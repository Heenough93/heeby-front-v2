import { describe, expect, it } from "vitest";
import {
  moneyFlowAccountInputSchema,
  moneyFlowRuleInputSchema,
  moneyFlowRuleListSchema,
  moneyFlowTransferUpdateSchema
} from "@/features/assets/lib/money-flow-schema";
import type { MoneyFlowRule } from "@/features/assets/lib/money-flow-types";

const now = "2026-04-11T00:00:00.000Z";

function createRule(overrides: Partial<MoneyFlowRule> = {}): MoneyFlowRule {
  return {
    id: overrides.id ?? "rule-1",
    ownerScope: overrides.ownerScope ?? "yumja",
    fromAccountId: overrides.fromAccountId ?? "salary",
    toAccountId: overrides.toAccountId ?? "living",
    amountType: overrides.amountType ?? "fixed",
    amount: overrides.amount ?? 100000,
    order: overrides.order ?? 1,
    isActive: overrides.isActive ?? true,
    note: overrides.note,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now
  };
}

describe("money flow schema", () => {
  it("trims account text fields and accepts non-negative amounts", () => {
    const parsed = moneyFlowAccountInputSchema.parse({
      name: " 생활비 ",
      ownerScope: "yumja",
      role: "living",
      bankName: " 카카오뱅크 ",
      currentBalance: 300000,
      targetAmount: 800000,
      isActive: true,
      note: " 월 생활비 "
    });

    expect(parsed.name).toBe("생활비");
    expect(parsed.bankName).toBe("카카오뱅크");
    expect(parsed.note).toBe("월 생활비");
  });

  it("accepts extended account roles for actual money buckets", () => {
    expect(
      moneyFlowAccountInputSchema.safeParse({
        name: "투자대기금",
        ownerScope: "yumja",
        role: "investmentReady",
        currentBalance: 1000000,
        isActive: true
      }).success
    ).toBe(true);
    expect(
      moneyFlowAccountInputSchema.safeParse({
        name: "대출상환",
        ownerScope: "yumja",
        role: "loanPayment",
        currentBalance: 500000,
        isActive: true
      }).success
    ).toBe(true);
  });

  it("rejects blank account names and negative balances", () => {
    const parsed = moneyFlowAccountInputSchema.safeParse({
      name: " ",
      ownerScope: "yumja",
      role: "living",
      currentBalance: -1,
      isActive: true
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects rules with the same source and destination account", () => {
    const parsed = moneyFlowRuleInputSchema.safeParse({
      fromAccountId: "salary",
      ownerScope: "yumja",
      toAccountId: "salary",
      amountType: "fixed",
      amount: 100000,
      isActive: true
    });

    expect(parsed.success).toBe(false);
  });

  it("allows only one active remainder rule", () => {
    const parsed = moneyFlowRuleListSchema.safeParse([
      createRule({ id: "remainder-1", amountType: "remainder" }),
      createRule({ id: "remainder-2", amountType: "remainder", order: 2 })
    ]);

    expect(parsed.success).toBe(false);
  });

  it("allows inactive duplicate remainder rules", () => {
    const parsed = moneyFlowRuleListSchema.safeParse([
      createRule({ id: "remainder-1", amountType: "remainder" }),
      createRule({
        id: "remainder-2",
        amountType: "remainder",
        order: 2,
        isActive: false
      })
    ]);

    expect(parsed.success).toBe(true);
  });

  it("validates transfer updates", () => {
    expect(
      moneyFlowTransferUpdateSchema.safeParse({
        actualAmount: 620000,
        dayOfMonth: 25,
        memo: "여행 예산 반영",
        isChecked: true
      }).success
    ).toBe(true);
    expect(moneyFlowTransferUpdateSchema.safeParse({ actualAmount: -1 }).success).toBe(false);
    expect(moneyFlowTransferUpdateSchema.safeParse({ dayOfMonth: 32 }).success).toBe(false);
  });
});
