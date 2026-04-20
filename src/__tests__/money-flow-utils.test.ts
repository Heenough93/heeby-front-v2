import { describe, expect, it } from "vitest";
import {
  buildMonthlyEntriesFromRules,
  getMoneyFlowAccountRoleLabel,
  getMoneyFlowDashboardSummary,
  getMoneyFlowStartMonthPreview,
  getMoneyFlowStatusMessage,
  sortMoneyFlowSnapshots,
  sortMoneyFlowTransfers
} from "@/features/assets/lib/money-flow-utils";
import type {
  MoneyFlowAccount,
  MoneyFlowMonthlyEntry,
  MoneyFlowRule,
  MoneyFlowSnapshot,
  MoneyFlowTransfer
} from "@/features/assets/lib/money-flow-types";

const now = "2026-04-11T00:00:00.000Z";

const accounts: MoneyFlowAccount[] = [
  {
    id: "salary",
    ownerScope: "yumja",
    name: "급여계좌",
    role: "salary",
    currentBalance: 3000000,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "living",
    ownerScope: "yumja",
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
    ownerScope: "yumja",
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
    ownerScope: "yumja",
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
    ownerScope: "yumja",
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
    ownerScope: "yumja",
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
  it("labels the supported account roles", () => {
    expect(getMoneyFlowAccountRoleLabel("investmentReady")).toBe("투자대기금");
    expect(getMoneyFlowAccountRoleLabel("retirement")).toBe("노후");
    expect(getMoneyFlowAccountRoleLabel("subscription")).toBe("청약");
    expect(getMoneyFlowAccountRoleLabel("loanPayment")).toBe("대출상환");
    expect(getMoneyFlowAccountRoleLabel("etc")).toBe("기타");
  });

  it("builds monthly entries from active rules in rule order", () => {
    const entries = buildMonthlyEntriesFromRules({
      ownerScope: "yumja",
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
      id: "yumja-2026-05-salary-check",
      ownerScope: "yumja",
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
        ownerScope: "yumja",
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
        ownerScope: "yumja",
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
        ownerScope: "yumja",
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

  it("previews what the start month action will generate", () => {
    expect(getMoneyFlowStartMonthPreview({ accounts, rules })).toEqual({
      salaryAmount: 3000000,
      activeRuleCount: 2,
      expectedEntryCount: 3,
      fixedTotalAmount: 800000,
      hasRemainderRule: true
    });
  });

  it("sorts monthly snapshots and transfers for archive rendering", () => {
    const snapshots: MoneyFlowSnapshot[] = [
      {
        id: "snapshot-2026-04-old",
        ownerScope: "yumja",
        monthKey: "2026-04",
        title: "4월 이전 수정",
        status: "done",
        createdAt: now,
        updatedAt: "2026-04-10T00:00:00.000Z"
      },
      {
        id: "snapshot-2026-05",
        ownerScope: "yumja",
        monthKey: "2026-05",
        title: "5월",
        status: "draft",
        createdAt: now,
        updatedAt: "2026-04-01T00:00:00.000Z"
      },
      {
        id: "snapshot-2026-04-new",
        ownerScope: "yumja",
        monthKey: "2026-04",
        title: "4월 최근 수정",
        status: "done",
        createdAt: now,
        updatedAt: "2026-04-12T00:00:00.000Z"
      }
    ];
    const transfers: MoneyFlowTransfer[] = [
      {
        id: "one-off",
        snapshotId: "snapshot-2026-05",
        fromAccountId: "salary",
        toAccountId: "surplus",
        amountType: "fixed",
        plannedAmount: 100000,
        order: 1,
        isOneOff: true,
        isChecked: false,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "second",
        snapshotId: "snapshot-2026-05",
        fromAccountId: "salary",
        toAccountId: "surplus",
        amountType: "fixed",
        plannedAmount: 200000,
        dayOfMonth: 1,
        order: 2,
        isOneOff: false,
        isChecked: false,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "first",
        snapshotId: "snapshot-2026-05",
        fromAccountId: "salary",
        toAccountId: "living",
        amountType: "fixed",
        plannedAmount: 300000,
        dayOfMonth: 1,
        order: 1,
        isOneOff: false,
        isChecked: false,
        createdAt: now,
        updatedAt: now
      }
    ];

    expect(sortMoneyFlowSnapshots(snapshots).map((snapshot) => snapshot.id)).toEqual([
      "snapshot-2026-05",
      "snapshot-2026-04-new",
      "snapshot-2026-04-old"
    ]);
    expect(sortMoneyFlowTransfers(transfers).map((transfer) => transfer.id)).toEqual([
      "first",
      "second",
      "one-off"
    ]);
  });
});
