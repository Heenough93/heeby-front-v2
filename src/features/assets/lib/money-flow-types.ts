export const moneyFlowAccountRoleValues = [
  "salary",
  "living",
  "fixedExpense",
  "cardPayment",
  "emergency",
  "surplus",
  "saving"
] as const;

export const moneyFlowRuleTypeValues = ["fixed", "remainder"] as const;

export type MoneyFlowAccountRole = (typeof moneyFlowAccountRoleValues)[number];
export type MoneyFlowRuleType = (typeof moneyFlowRuleTypeValues)[number];

export type MoneyFlowAccount = {
  id: string;
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

export type MoneyFlowAccountInput = {
  name: string;
  role: MoneyFlowAccountRole;
  bankName?: string;
  currentBalance: number;
  targetAmount?: number;
  isActive: boolean;
  note?: string;
};

export type MoneyFlowRuleInput = {
  fromAccountId: string;
  toAccountId: string;
  amountType: MoneyFlowRuleType;
  amount: number;
  isActive: boolean;
  note?: string;
};
