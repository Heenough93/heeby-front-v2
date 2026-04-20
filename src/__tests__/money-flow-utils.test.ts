import { describe, expect, it } from "vitest";
import {
  buildMoneyFlowSnapshotCopy,
  buildMoneyFlowSnapshotFromRules,
  getMoneyFlowAccountRoleLabel,
  getMoneyFlowStartMonthPreview,
  getMoneyFlowTransferDashboardSummary,
  getMoneyFlowTransferStatusMessage,
  sortMoneyFlowSnapshots,
  sortMoneyFlowTransfers
} from "@/features/assets/lib/money-flow-utils";
import type {
  MoneyFlowAccount,
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
    expect(getMoneyFlowAccountRoleLabel("controller")).toBe("컨트롤러");
    expect(getMoneyFlowAccountRoleLabel("investmentReady")).toBe("투자대기금");
    expect(getMoneyFlowAccountRoleLabel("retirement")).toBe("노후");
    expect(getMoneyFlowAccountRoleLabel("subscription")).toBe("청약");
    expect(getMoneyFlowAccountRoleLabel("loanPayment")).toBe("대출상환");
    expect(getMoneyFlowAccountRoleLabel("etc")).toBe("기타");
  });

  it("summarizes dashboard values from accounts and transfers", () => {
    const transfers: MoneyFlowTransfer[] = [
      {
        id: "living-transfer",
        snapshotId: "snapshot-2026-05",
        fromAccountId: "salary",
        toAccountId: "living",
        amountType: "fixed",
        plannedAmount: 800000,
        actualAmount: 800000,
        order: 1,
        isOneOff: false,
        isChecked: false,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "surplus-transfer",
        snapshotId: "snapshot-2026-05",
        fromAccountId: "salary",
        toAccountId: "surplus",
        amountType: "remainder",
        plannedAmount: 3000000,
        actualAmount: 620000,
        order: 2,
        isOneOff: false,
        isChecked: true,
        createdAt: now,
        updatedAt: now
      }
    ];

    expect(getMoneyFlowTransferDashboardSummary({ accounts, transfers })).toEqual({
      salaryAmount: 3000000,
      completedRatio: 50,
      pendingCount: 1,
      expectedSurplus: 620000
    });
    expect(getMoneyFlowTransferStatusMessage({ accounts, transfers })).toBe("생활비 이체 필요");
  });

  it("previews what the start month action will generate", () => {
    expect(getMoneyFlowStartMonthPreview({ accounts, rules })).toEqual({
      salaryAmount: 3000000,
      activeRuleCount: 2,
      expectedEntryCount: 2,
      fixedTotalAmount: 800000,
      hasRemainderRule: true
    });
  });

  it("builds a monthly snapshot and transfers from active rules", () => {
    const result = buildMoneyFlowSnapshotFromRules({
      ownerScope: "yumja",
      monthKey: "2026-05",
      rules,
      now,
      snapshotId: "snapshot-yumja-2026-05"
    });

    expect(result.snapshot).toMatchObject({
      id: "snapshot-yumja-2026-05",
      ownerScope: "yumja",
      monthKey: "2026-05",
      title: "2026-05 윰자 현금 흐름",
      status: "inProgress"
    });
    expect(result.transfers.map((transfer) => transfer.sourceRuleId)).toEqual([
      "living-rule",
      "surplus-rule"
    ]);
    expect(result.transfers[0]).toMatchObject({
      snapshotId: "snapshot-yumja-2026-05",
      amountType: "fixed",
      plannedAmount: 800000,
      actualAmount: 800000,
      isOneOff: false,
      isChecked: false
    });
    expect(result.transfers[1]).toMatchObject({
      amountType: "remainder",
      plannedAmount: 2200000,
      actualAmount: undefined
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
      "one-off",
      "second"
    ]);
  });

  it("copies a monthly snapshot without one-off transfers", () => {
    const sourceSnapshot: MoneyFlowSnapshot = {
      id: "snapshot-2026-05",
      ownerScope: "yumja",
      monthKey: "2026-05",
      title: "2026-05 윰자 현금 흐름",
      status: "done",
      createdAt: now,
      updatedAt: now
    };
    const result = buildMoneyFlowSnapshotCopy({
      sourceSnapshot,
      sourceTransfers: [
        {
          id: "rule-transfer",
          snapshotId: sourceSnapshot.id,
          sourceRuleId: "living-rule",
          fromAccountId: "salary",
          toAccountId: "living",
          amountType: "fixed",
          plannedAmount: 800000,
          actualAmount: 700000,
          dayOfMonth: 25,
          order: 1,
          isOneOff: false,
          isChecked: true,
          checkedAt: now,
          memo: "유지할 메모",
          createdAt: now,
          updatedAt: now
        },
        {
          id: "one-off-transfer",
          snapshotId: sourceSnapshot.id,
          fromAccountId: "salary",
          toAccountId: "surplus",
          amountType: "fixed",
          plannedAmount: 100000,
          order: 2,
          isOneOff: true,
          isChecked: true,
          createdAt: now,
          updatedAt: now
        }
      ],
      targetMonthKey: "2026-06",
      now,
      snapshotId: "snapshot-2026-06"
    });

    expect(result.snapshot).toMatchObject({
      id: "snapshot-2026-06",
      ownerScope: "yumja",
      monthKey: "2026-06",
      title: "2026-06 윰자 현금 흐름",
      status: "draft",
      sourceSnapshotId: "snapshot-2026-05"
    });
    expect(result.transfers).toHaveLength(1);
    expect(result.transfers[0]).toMatchObject({
      snapshotId: "snapshot-2026-06",
      sourceRuleId: "living-rule",
      plannedAmount: 800000,
      actualAmount: 800000,
      dayOfMonth: 25,
      isOneOff: false,
      isChecked: false,
      memo: "유지할 메모"
    });
    expect("checkedAt" in result.transfers[0]!).toBe(false);
  });
});
