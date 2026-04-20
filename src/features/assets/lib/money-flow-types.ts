import type { OwnerScope } from "@/types/domain";

export const moneyFlowAccountRoleValues = [
  "salary",
  "controller",
  "living",
  "fixedExpense",
  "cardPayment",
  "emergency",
  "surplus",
  "saving",
  "investmentReady",
  "retirement",
  "subscription",
  "loanPayment",
  "etc"
] as const;

export const moneyFlowRuleTypeValues = ["fixed", "remainder"] as const;
export const moneyFlowSnapshotStatusValues = ["draft", "ready", "inProgress", "done"] as const;

export type MoneyFlowAccountRole = (typeof moneyFlowAccountRoleValues)[number];
export type MoneyFlowRuleType = (typeof moneyFlowRuleTypeValues)[number];
export type MoneyFlowSnapshotStatus = (typeof moneyFlowSnapshotStatusValues)[number];

export type MoneyFlowAccount = {
  id: string;
  ownerScope: OwnerScope;
  name: string;
  role: MoneyFlowAccountRole;
  bankName?: string;
  currentBalance: number;
  targetAmount?: number;
  isActive: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type MoneyFlowRule = {
  id: string;
  ownerScope: OwnerScope;
  fromAccountId: string;
  toAccountId: string;
  amountType: MoneyFlowRuleType;
  amount: number;
  order: number;
  isActive: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type MoneyFlowMonthlyEntry = {
  id: string;
  ownerScope: OwnerScope;
  monthKey: string;
  title: string;
  ruleId?: string;
  plannedAmount: number;
  actualAmount?: number;
  isChecked: boolean;
  checkedAt?: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
};

export type MoneyFlowSnapshot = {
  id: string;
  ownerScope: OwnerScope;
  monthKey: string;
  title: string;
  status: MoneyFlowSnapshotStatus;
  sourceSnapshotId?: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
};

export type MoneyFlowTransfer = {
  id: string;
  snapshotId: string;
  sourceRuleId?: string;
  fromAccountId: string;
  toAccountId: string;
  amountType: MoneyFlowRuleType;
  plannedAmount: number;
  actualAmount?: number;
  dayOfMonth?: number;
  order: number;
  isOneOff: boolean;
  isChecked: boolean;
  checkedAt?: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
};

export type MoneyFlowTransferUpdateInput = Partial<
  Pick<MoneyFlowTransfer, "actualAmount" | "dayOfMonth" | "memo" | "isChecked">
>;

export type MoneyFlowTransferInput = {
  snapshotId: string;
  fromAccountId: string;
  toAccountId: string;
  amountType: MoneyFlowRuleType;
  plannedAmount: number;
  actualAmount?: number;
  dayOfMonth?: number;
  memo?: string;
};

export type MoneyFlowAccountInput = {
  ownerScope: OwnerScope;
  name: string;
  role: MoneyFlowAccountRole;
  bankName?: string;
  currentBalance: number;
  targetAmount?: number;
  isActive: boolean;
  note?: string;
};

export type MoneyFlowRuleInput = {
  ownerScope: OwnerScope;
  fromAccountId: string;
  toAccountId: string;
  amountType: MoneyFlowRuleType;
  amount: number;
  isActive: boolean;
  note?: string;
};
