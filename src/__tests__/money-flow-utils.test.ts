import { describe, expect, it } from "vitest";
import {
  buildMonthlyEntriesFromRules,
  getMoneyFlowDashboardSummary,
  getMoneyFlowStatusMessage
} from "@/features/assets/lib/money-flow-utils";
import type {
  MoneyFlowAccount,
  MoneyFlowMonthlyEntry,
  MoneyFlowRule
} from "@/features/assets/lib/money-flow-types";

const now = "2026-04-11T00:00:00.000Z";

const accounts: MoneyFlowAccount[] = [
  {
    id: "salary",
    name: "급여계좌",
    role: "salary",
    currentBalance: 3000000,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "living",
    name: "생활비",
    role: "living",
    currentBalance: 300000,
    targetAmount: 800000,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "surplus",
    name: "여윳돈",
    role: "surplus",
    currentBalance: 620000,
    isActive: true,
    createdAt: now,
    updatedAt: now
  }
];

const rules: MoneyFlowRule[] = [
  {
    id: "surplus-rule",
    fromAccountId: "salary",
    toAccountId: "surplus",
    amountType: "remainder",
    amount: 2200000,
    order: 2,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "living-rule",
    fromAccountId: "salary",
    toAccountId: "living",
    amountType: "fixed",
    amount: 800000,
    order: 1,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "inactive-rule",
    fromAccountId: "salary",
    toAccountId: "living",
    amountType: "fixed",
    amount: 100000,
    order: 3,
    isActive: false,
    createdAt: now,
    updatedAt: now
  }
];

describe("money flow utils", () => {
  it("builds monthly entries from active rules in rule order", () => {
    const entries = buildMonthlyEntriesFromRules({
      monthKey: "2026-05",
      salaryAmount: 3000000,
      rules,
      accounts,
      now
    });

    expect(entries.map((entry) => entry.title)).toEqual([
      "급여 입금 확인",
      "생활비 이체",
      "여윳돈 이체"
    ]);
    expect(entries[0]).toMatchObject({
      id: "2026-05-salary-check",
      plannedAmount: 3000000,
      actualAmount: 3000000,
      isChecked: false
    });
    expect(entries[1]).toMatchObject({
      ruleId: "living-rule",
      plannedAmount: 800000,
      actualAmount: 800000
    });
    expect(entries[2]).toMatchObject({
      ruleId: "surplus-rule",
      plannedAmount: 2200000,
      actualAmount: undefined
    });
  });

  it("summarizes dashboard values from accounts and monthly entries", () => {
    const monthlyEntries: MoneyFlowMonthlyEntry[] = [
      {
        id: "salary-entry",
        monthKey: "2026-05",
        title: "급여 입금 확인",
        plannedAmount: 3000000,
        actualAmount: 3000000,
        isChecked: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "living-entry",
        monthKey: "2026-05",
        title: "생활비 이체",
        plannedAmount: 800000,
        actualAmount: 800000,
        isChecked: false,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "surplus-entry",
        monthKey: "2026-05",
        title: "여윳돈 이체",
        plannedAmount: 2200000,
        actualAmount: 620000,
        isChecked: false,
        createdAt: now,
        updatedAt: now
      }
    ];

    expect(getMoneyFlowDashboardSummary({ accounts, monthlyEntries })).toEqual({
      salaryAmount: 3000000,
      completedRatio: 33,
      pendingCount: 2,
      expectedSurplus: 620000
    });
    expect(getMoneyFlowStatusMessage(monthlyEntries)).toBe("생활비 이체 필요");
  });
});
