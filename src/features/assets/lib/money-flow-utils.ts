import dayjs from "dayjs";
import type {
  MoneyFlowAccount,
  MoneyFlowAccountRole,
  MoneyFlowMonthlyEntry,
  MoneyFlowRule
} from "@/features/assets/lib/money-flow-types";

export function formatMoneyFlowAmount(amount: number) {
  return `${Math.round(amount).toLocaleString("ko-KR")}원`;
}

export function getCurrentMoneyFlowMonthKey(input = dayjs()) {
  return input.format("YYYY-MM");
}

export function getMoneyFlowAccountRoleLabel(role: MoneyFlowAccountRole) {
  switch (role) {
    case "salary":
      return "급여";
    case "living":
      return "생활비";
    case "fixedExpense":
      return "고정지출";
    case "cardPayment":
      return "카드결제";
    case "emergency":
      return "비상금";
    case "surplus":
      return "여윳돈";
    case "saving":
      return "저축";
  }
}

export function getMoneyFlowRuleTypeLabel(rule: MoneyFlowRule) {
  return rule.amountType === "remainder" ? "잔여" : "고정 금액";
}

export function formatMoneyFlowCheckedAt(checkedAt?: string) {
  if (!checkedAt) {
    return "아직 미완료";
  }

  return dayjs(checkedAt).format("YYYY.MM.DD HH:mm");
}

export function getMoneyFlowMonthlyTitle(rule: MoneyFlowRule, toAccountName: string) {
  if (rule.amountType === "remainder") {
    return `${toAccountName} 이체`;
  }

  if (toAccountName.includes("카드")) {
    return `${toAccountName} 충전`;
  }

  return `${toAccountName} 이체`;
}

export function sortMoneyFlowAccounts(accounts: MoneyFlowAccount[]) {
  return [...accounts].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function sortMoneyFlowRules(rules: MoneyFlowRule[]) {
  return [...rules].sort((a, b) => a.order - b.order);
}

export function sortMoneyFlowMonthlyEntries(entries: MoneyFlowMonthlyEntry[]) {
  return [...entries].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getMoneyFlowDashboardSummary(params: {
  accounts: MoneyFlowAccount[];
  monthlyEntries: MoneyFlowMonthlyEntry[];
}) {
  const salaryAmount = params.accounts
    .filter((account) => account.role === "salary" && account.isActive)
    .reduce((sum, account) => sum + account.currentBalance, 0);
  const completedCount = params.monthlyEntries.filter((entry) => entry.isChecked).length;
  const totalCount = params.monthlyEntries.length;
  const pendingCount = totalCount - completedCount;
  const expectedSurplus =
    params.monthlyEntries.find((entry) => entry.title.includes("여윳돈"))?.actualAmount ??
    params.monthlyEntries.find((entry) => entry.title.includes("여윳돈"))?.plannedAmount ??
    0;

  return {
    salaryAmount,
    completedRatio: totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100),
    pendingCount,
    expectedSurplus
  };
}

export function getMoneyFlowStatusMessage(entries: MoneyFlowMonthlyEntry[]) {
  const nextPendingEntry = entries.find((entry) => !entry.isChecked);

  if (!nextPendingEntry) {
    return "이번 달 배분 완료";
  }

  return `${nextPendingEntry.title} 필요`;
}

export function getMoneyFlowAccountStatus(account: MoneyFlowAccount) {
  if (!account.isActive) {
    return "inactive";
  }

  if (account.targetAmount !== undefined && account.currentBalance < account.targetAmount) {
    return "warning";
  }

  return "healthy";
}

export function getMoneyFlowPlannedAmount(rule: MoneyFlowRule, monthlyEntries: MoneyFlowMonthlyEntry[]) {
  return monthlyEntries.find((entry) => entry.ruleId === rule.id)?.plannedAmount ?? rule.amount;
}

export function getMoneyFlowStartMonthPreview(params: {
  accounts: MoneyFlowAccount[];
  rules: MoneyFlowRule[];
}) {
  const salaryAmount = params.accounts
    .filter((account) => account.role === "salary" && account.isActive)
    .reduce((sum, account) => sum + account.currentBalance, 0);
  const activeRules = sortMoneyFlowRules(params.rules).filter((rule) => rule.isActive);
  const fixedTotalAmount = activeRules
    .filter((rule) => rule.amountType === "fixed")
    .reduce((sum, rule) => sum + rule.amount, 0);
  const hasRemainderRule = activeRules.some((rule) => rule.amountType === "remainder");

  return {
    salaryAmount,
    activeRuleCount: activeRules.length,
    expectedEntryCount: activeRules.length + 1,
    fixedTotalAmount,
    hasRemainderRule
  };
}

export function buildMonthlyEntriesFromRules(params: {
  monthKey: string;
  salaryAmount: number;
  rules: MoneyFlowRule[];
  accounts: MoneyFlowAccount[];
  now?: string;
}) {
  const now = params.now ?? dayjs().toISOString();
  const accountById = new Map(params.accounts.map((account) => [account.id, account]));
  const activeRules = sortMoneyFlowRules(params.rules).filter((rule) => rule.isActive);

  return [
    {
      id: `${params.monthKey}-salary-check`,
      monthKey: params.monthKey,
      title: "급여 입금 확인",
      plannedAmount: params.salaryAmount,
      actualAmount: params.salaryAmount,
      isChecked: false,
      createdAt: now,
      updatedAt: now
    },
    ...activeRules.map((rule) => {
      const toAccount = accountById.get(rule.toAccountId);

      return {
        id: `${params.monthKey}-${rule.id}`,
        monthKey: params.monthKey,
        title: getMoneyFlowMonthlyTitle(rule, toAccount?.name ?? "이체"),
        ruleId: rule.id,
        plannedAmount: rule.amount,
        actualAmount: rule.amountType === "remainder" ? undefined : rule.amount,
        isChecked: false,
        createdAt: now,
        updatedAt: now
      };
    })
  ];
}

export function buildMoneyFlowLineItems(params: {
  accounts: MoneyFlowAccount[];
  rules: MoneyFlowRule[];
  monthlyEntries: MoneyFlowMonthlyEntry[];
}) {
  const accountById = new Map(params.accounts.map((account) => [account.id, account]));

  return sortMoneyFlowRules(params.rules)
    .filter((rule) => rule.isActive)
    .map((rule) => ({
      id: rule.id,
      fromAccount: accountById.get(rule.fromAccountId),
      toAccount: accountById.get(rule.toAccountId),
      amount: getMoneyFlowPlannedAmount(rule, params.monthlyEntries),
      amountType: rule.amountType
    }))
    .filter((item) => item.fromAccount && item.toAccount);
}
