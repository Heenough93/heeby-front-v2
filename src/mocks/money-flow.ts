import type {
  MoneyFlowAccount,
  MoneyFlowMonthlyEntry,
  MoneyFlowRule,
  MoneyFlowSnapshot,
  MoneyFlowTransfer
} from "@/features/assets/lib/money-flow-types";

const now = "2026-04-10T09:00:00.000Z";

export const moneyFlowAccounts: MoneyFlowAccount[] = [
  {
    id: "flow-account-salary",
    ownerScope: "yumja",
    name: "급여계좌",
    role: "salary",
    bankName: "국민은행",
    currentBalance: 3000000,
    isActive: true,
    note: "월급이 가장 먼저 들어오는 출발 계좌",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "flow-account-living",
    ownerScope: "yumja",
    name: "생활비",
    role: "living",
    bankName: "카카오뱅크",
    currentBalance: 300000,
    targetAmount: 800000,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "flow-account-card",
    ownerScope: "yumja",
    name: "카드결제",
    role: "cardPayment",
    bankName: "토스뱅크",
    currentBalance: 180000,
    targetAmount: 500000,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "flow-account-fixed",
    ownerScope: "yumja",
    name: "고정지출",
    role: "fixedExpense",
    bankName: "신한은행",
    currentBalance: 700000,
    targetAmount: 700000,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "flow-account-emergency",
    ownerScope: "yumja",
    name: "비상금",
    role: "emergency",
    bankName: "케이뱅크",
    currentBalance: 5000000,
    targetAmount: 5200000,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "flow-account-surplus",
    ownerScope: "yumja",
    name: "여윳돈",
    role: "surplus",
    bankName: "하나은행",
    currentBalance: 320000,
    targetAmount: 600000,
    isActive: true,
    note: "남는 돈이 마지막으로 모이는 계좌",
    createdAt: now,
    updatedAt: now
  }
];

export const moneyFlowRules: MoneyFlowRule[] = [
  {
    id: "flow-rule-living",
    ownerScope: "yumja",
    fromAccountId: "flow-account-salary",
    toAccountId: "flow-account-living",
    amountType: "fixed",
    amount: 800000,
    order: 1,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "flow-rule-card",
    ownerScope: "yumja",
    fromAccountId: "flow-account-salary",
    toAccountId: "flow-account-card",
    amountType: "fixed",
    amount: 500000,
    order: 2,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "flow-rule-fixed",
    ownerScope: "yumja",
    fromAccountId: "flow-account-salary",
    toAccountId: "flow-account-fixed",
    amountType: "fixed",
    amount: 700000,
    order: 3,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "flow-rule-emergency",
    ownerScope: "yumja",
    fromAccountId: "flow-account-salary",
    toAccountId: "flow-account-emergency",
    amountType: "fixed",
    amount: 200000,
    order: 4,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "flow-rule-surplus",
    ownerScope: "yumja",
    fromAccountId: "flow-account-salary",
    toAccountId: "flow-account-surplus",
    amountType: "remainder",
    amount: 800000,
    order: 5,
    isActive: true,
    note: "고정 배분 후 남는 금액 전체",
    createdAt: now,
    updatedAt: now
  }
];

export const moneyFlowMonthlyEntries: MoneyFlowMonthlyEntry[] = [
  {
    id: "flow-entry-salary",
    ownerScope: "yumja",
    monthKey: "2026-04",
    title: "급여 입금 확인",
    plannedAmount: 3000000,
    actualAmount: 3000000,
    isChecked: true,
    checkedAt: "2026-04-01T00:10:00.000Z",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "flow-entry-living",
    ownerScope: "yumja",
    monthKey: "2026-04",
    title: "생활비 이체",
    ruleId: "flow-rule-living",
    plannedAmount: 800000,
    actualAmount: 800000,
    isChecked: true,
    checkedAt: "2026-04-01T00:20:00.000Z",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "flow-entry-card",
    ownerScope: "yumja",
    monthKey: "2026-04",
    title: "카드결제 충전",
    ruleId: "flow-rule-card",
    plannedAmount: 500000,
    actualAmount: 0,
    isChecked: false,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "flow-entry-fixed",
    ownerScope: "yumja",
    monthKey: "2026-04",
    title: "고정지출 이체",
    ruleId: "flow-rule-fixed",
    plannedAmount: 700000,
    actualAmount: 700000,
    isChecked: true,
    checkedAt: "2026-04-01T00:30:00.000Z",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "flow-entry-emergency",
    ownerScope: "yumja",
    monthKey: "2026-04",
    title: "비상금 이체",
    ruleId: "flow-rule-emergency",
    plannedAmount: 200000,
    actualAmount: 0,
    isChecked: false,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "flow-entry-surplus",
    ownerScope: "yumja",
    monthKey: "2026-04",
    title: "여윳돈 이체",
    ruleId: "flow-rule-surplus",
    plannedAmount: 800000,
    actualAmount: 620000,
    isChecked: false,
    memo: "여행 예산 때문에 예상보다 적게 남았습니다.",
    createdAt: now,
    updatedAt: now
  }
];

export const moneyFlowSnapshots: MoneyFlowSnapshot[] = [
  {
    id: "flow-snapshot-yumja-2026-04",
    ownerScope: "yumja",
    monthKey: "2026-04",
    title: "2026-04 윰자 현금 흐름",
    status: "inProgress",
    memo: "기존 월간 체크 데이터를 snapshot 구조로 옮기기 전 기준 데이터",
    createdAt: now,
    updatedAt: now
  }
];

export const moneyFlowTransfers: MoneyFlowTransfer[] = [
  {
    id: "flow-transfer-living",
    snapshotId: "flow-snapshot-yumja-2026-04",
    sourceRuleId: "flow-rule-living",
    fromAccountId: "flow-account-salary",
    toAccountId: "flow-account-living",
    amountType: "fixed",
    plannedAmount: 800000,
    actualAmount: 800000,
    order: 1,
    isOneOff: false,
    isChecked: true,
    checkedAt: "2026-04-01T00:20:00.000Z",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "flow-transfer-card",
    snapshotId: "flow-snapshot-yumja-2026-04",
    sourceRuleId: "flow-rule-card",
    fromAccountId: "flow-account-salary",
    toAccountId: "flow-account-card",
    amountType: "fixed",
    plannedAmount: 500000,
    actualAmount: 0,
    order: 2,
    isOneOff: false,
    isChecked: false,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "flow-transfer-fixed",
    snapshotId: "flow-snapshot-yumja-2026-04",
    sourceRuleId: "flow-rule-fixed",
    fromAccountId: "flow-account-salary",
    toAccountId: "flow-account-fixed",
    amountType: "fixed",
    plannedAmount: 700000,
    actualAmount: 700000,
    order: 3,
    isOneOff: false,
    isChecked: true,
    checkedAt: "2026-04-01T00:30:00.000Z",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "flow-transfer-emergency",
    snapshotId: "flow-snapshot-yumja-2026-04",
    sourceRuleId: "flow-rule-emergency",
    fromAccountId: "flow-account-salary",
    toAccountId: "flow-account-emergency",
    amountType: "fixed",
    plannedAmount: 200000,
    actualAmount: 0,
    order: 4,
    isOneOff: false,
    isChecked: false,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "flow-transfer-surplus",
    snapshotId: "flow-snapshot-yumja-2026-04",
    sourceRuleId: "flow-rule-surplus",
    fromAccountId: "flow-account-salary",
    toAccountId: "flow-account-surplus",
    amountType: "remainder",
    plannedAmount: 800000,
    actualAmount: 620000,
    order: 5,
    isOneOff: false,
    isChecked: false,
    memo: "여행 예산 때문에 예상보다 적게 남았습니다.",
    createdAt: now,
    updatedAt: now
  }
];
