import dayjs from "dayjs";
import type {
  MoneyFlowAccount,
  MoneyFlowAccountRole,
  MoneyFlowMonthlyEntry,
  MoneyFlowRule,
  MoneyFlowSnapshot,
  MoneyFlowTransfer
} from "@/features/assets/lib/money-flow-types";
import { getOwnerScopeLabel } from "@/types/domain";
import type { OwnerScope } from "@/types/domain";

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
    case "investmentReady":
      return "투자대기금";
    case "retirement":
      return "노후";
    case "subscription":
      return "청약";
    case "loanPayment":
      return "대출상환";
    case "etc":
      return "기타";
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

export function sortMoneyFlowAccounts(accounts: MoneyFlowAccount[]) {
  return [...accounts].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function sortMoneyFlowRules(rules: MoneyFlowRule[]) {
  return [...rules].sort((a, b) => a.order - b.order);
}

export function sortMoneyFlowMonthlyEntries(entries: MoneyFlowMonthlyEntry[]) {
  return [...entries].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function sortMoneyFlowSnapshots(snapshots: MoneyFlowSnapshot[]) {
  return [...snapshots].sort((a, b) => {
    const monthOrder = b.monthKey.localeCompare(a.monthKey);

    if (monthOrder !== 0) {
      return monthOrder;
    }

    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export function sortMoneyFlowTransfers(transfers: MoneyFlowTransfer[]) {
  return [...transfers].sort((a, b) => {
    const dayOrder = (a.dayOfMonth ?? 99) - (b.dayOfMonth ?? 99);

    if (dayOrder !== 0) {
      return dayOrder;
    }

    return a.order - b.order;
  });
}

export function getMoneyFlowTransferTitle(
  transfer: MoneyFlowTransfer,
  toAccountName: string
) {
  if (transfer.amountType === "remainder") {
    return `${toAccountName} 이체`;
  }

  if (toAccountName.includes("카드")) {
    return `${toAccountName} 충전`;
  }

  return `${toAccountName} 이체`;
}

export function getMoneyFlowTransferStatusMessage(params: {
  transfers: MoneyFlowTransfer[];
  accounts: MoneyFlowAccount[];
}) {
  const accountById = new Map(params.accounts.map((account) => [account.id, account]));
  const nextPendingTransfer = sortMoneyFlowTransfers(params.transfers).find(
    (transfer) => !transfer.isChecked
  );

  if (!nextPendingTransfer) {
    return "이번 달 배분 완료";
  }

  return `${getMoneyFlowTransferTitle(
    nextPendingTransfer,
    accountById.get(nextPendingTransfer.toAccountId)?.name ?? "이체"
  )} 필요`;
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
    expectedEntryCount: activeRules.length,
    fixedTotalAmount,
    hasRemainderRule
  };
}

export function getMoneyFlowSnapshotTitle(ownerScope: OwnerScope, monthKey: string) {
  return `${monthKey} ${getOwnerScopeLabel(ownerScope)} 현금 흐름`;
}

export function buildMoneyFlowSnapshotFromRules(params: {
  ownerScope: OwnerScope;
  monthKey: string;
  rules: MoneyFlowRule[];
  now?: string;
  snapshotId?: string;
}) {
  const now = params.now ?? dayjs().toISOString();
  const snapshotId =
    params.snapshotId ?? `flow-snapshot-${params.ownerScope}-${params.monthKey}`;
  const activeRules = sortMoneyFlowRules(params.rules).filter((rule) => rule.isActive);
  const snapshot: MoneyFlowSnapshot = {
    id: snapshotId,
    ownerScope: params.ownerScope,
    monthKey: params.monthKey,
    title: getMoneyFlowSnapshotTitle(params.ownerScope, params.monthKey),
    status: activeRules.length > 0 ? "inProgress" : "draft",
    createdAt: now,
    updatedAt: now
  };
  const transfers: MoneyFlowTransfer[] = activeRules.map((rule) => ({
    id: `${snapshotId}-${rule.id}`,
    snapshotId,
    sourceRuleId: rule.id,
    fromAccountId: rule.fromAccountId,
    toAccountId: rule.toAccountId,
    amountType: rule.amountType,
    plannedAmount: rule.amount,
    actualAmount: rule.amountType === "remainder" ? undefined : rule.amount,
    order: rule.order,
    isOneOff: false,
    isChecked: false,
    createdAt: now,
    updatedAt: now
  }));

  return { snapshot, transfers };
}

export function getMoneyFlowTransferDashboardSummary(params: {
  accounts: MoneyFlowAccount[];
  transfers: MoneyFlowTransfer[];
}) {
  const salaryAmount = params.accounts
    .filter((account) => account.role === "salary" && account.isActive)
    .reduce((sum, account) => sum + account.currentBalance, 0);
  const completedCount = params.transfers.filter((transfer) => transfer.isChecked).length;
  const totalCount = params.transfers.length;
  const pendingCount = totalCount - completedCount;
  const surplusAccountIds = new Set(
    params.accounts
      .filter((account) => account.role === "surplus")
      .map((account) => account.id)
  );
  const expectedSurplus =
    params.transfers.find((transfer) => surplusAccountIds.has(transfer.toAccountId))
      ?.actualAmount ??
    params.transfers.find((transfer) => surplusAccountIds.has(transfer.toAccountId))
      ?.plannedAmount ??
    0;

  return {
    salaryAmount,
    completedRatio: totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100),
    pendingCount,
    expectedSurplus
  };
}

export function buildMoneyFlowTransferLineItems(params: {
  accounts: MoneyFlowAccount[];
  transfers: MoneyFlowTransfer[];
}) {
  const accountById = new Map(params.accounts.map((account) => [account.id, account]));

  return sortMoneyFlowTransfers(params.transfers)
    .map((transfer) => ({
      id: transfer.id,
      fromAccount: accountById.get(transfer.fromAccountId),
      toAccount: accountById.get(transfer.toAccountId),
      amount: transfer.actualAmount ?? transfer.plannedAmount,
      amountType: transfer.amountType,
      isOneOff: transfer.isOneOff,
      isChecked: transfer.isChecked,
      dayOfMonth: transfer.dayOfMonth
    }))
    .filter((item) => item.fromAccount && item.toAccount);
}
