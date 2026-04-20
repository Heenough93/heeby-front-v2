"use client";

import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  MoneyFlowAccount,
  MoneyFlowAccountInput,
  MoneyFlowMonthlyEntry,
  MoneyFlowRule,
  MoneyFlowRuleInput,
  MoneyFlowSnapshot,
  MoneyFlowTransfer,
  MoneyFlowTransferInput,
  MoneyFlowTransferUpdateInput
} from "@/features/assets/lib/money-flow-types";
import {
  moneyFlowAccountInputSchema,
  moneyFlowMonthlyEntryUpdateSchema,
  moneyFlowRuleInputSchema,
  moneyFlowTransferInputSchema,
  moneyFlowTransferUpdateSchema
} from "@/features/assets/lib/money-flow-schema";
import {
  buildMoneyFlowSnapshotCopy,
  buildMoneyFlowSnapshotFromRules,
  getCurrentMoneyFlowMonthKey,
  sortMoneyFlowAccounts,
  sortMoneyFlowMonthlyEntries,
  sortMoneyFlowRules,
  sortMoneyFlowSnapshots,
  sortMoneyFlowTransfers
} from "@/features/assets/lib/money-flow-utils";
import {
  moneyFlowAccounts as initialAccounts,
  moneyFlowMonthlyEntries as initialMonthlyEntries,
  moneyFlowRules as initialRules,
  moneyFlowSnapshots as initialSnapshots,
  moneyFlowTransfers as initialTransfers
} from "@/mocks/money-flow";
import type { OwnerScope } from "@/types/domain";

type MoneyFlowStore = {
  accounts: MoneyFlowAccount[];
  rules: MoneyFlowRule[];
  monthlyEntries: MoneyFlowMonthlyEntry[];
  snapshots: MoneyFlowSnapshot[];
  transfers: MoneyFlowTransfer[];
  addAccount: (input: MoneyFlowAccountInput) => void;
  updateAccount: (id: string, input: MoneyFlowAccountInput) => void;
  deleteAccount: (id: string) => void;
  moveAccount: (id: string, direction: "up" | "down") => void;
  addRule: (input: MoneyFlowRuleInput) => void;
  updateRule: (id: string, input: MoneyFlowRuleInput) => void;
  deleteRule: (id: string) => void;
  moveRule: (id: string, direction: "up" | "down") => void;
  updateMonthlyEntry: (
    id: string,
    input: Partial<Pick<MoneyFlowMonthlyEntry, "actualAmount" | "memo" | "isChecked">>
  ) => void;
  addTransfer: (input: MoneyFlowTransferInput) => void;
  updateTransfer: (id: string, input: MoneyFlowTransferUpdateInput) => void;
  deleteTransfer: (id: string) => void;
  moveTransfer: (id: string, direction: "up" | "down") => void;
  startMonthlyFlow: (ownerScope: OwnerScope, monthKey?: string) => void;
  copySnapshotToMonth: (sourceSnapshotId: string, targetMonthKey: string) => void;
  resetMoneyFlow: () => void;
};

function reorderByCreatedAt(items: Array<{ id: string; createdAt: string }>, id: string, direction: "up" | "down") {
  const nextItems = [...items];
  const index = nextItems.findIndex((item) => item.id === id);

  if (index === -1) {
    return nextItems;
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (targetIndex < 0 || targetIndex >= nextItems.length) {
    return nextItems;
  }

  const currentCreatedAt = nextItems[index]?.createdAt ?? "";
  nextItems[index] = {
    ...nextItems[index],
    createdAt: nextItems[targetIndex]?.createdAt ?? currentCreatedAt
  };
  nextItems[targetIndex] = {
    ...nextItems[targetIndex],
    createdAt: currentCreatedAt
  };

  return nextItems;
}

export const useMoneyFlowStore = create<MoneyFlowStore>()(
  persist(
    (set) => ({
      accounts: sortMoneyFlowAccounts(initialAccounts),
      rules: sortMoneyFlowRules(initialRules),
      monthlyEntries: sortMoneyFlowMonthlyEntries(initialMonthlyEntries),
      snapshots: sortMoneyFlowSnapshots(initialSnapshots),
      transfers: sortMoneyFlowTransfers(initialTransfers),
      addAccount: (input) =>
        set((state) => {
          const parsedInput = moneyFlowAccountInputSchema.safeParse(input);

          if (!parsedInput.success) {
            return { accounts: state.accounts };
          }

          const now = dayjs().toISOString();

          return {
            accounts: sortMoneyFlowAccounts([
              ...state.accounts,
              {
                id: nanoid(),
                ...parsedInput.data,
                createdAt: now,
                updatedAt: now
              }
            ])
          };
        }),
      updateAccount: (id, input) =>
        set((state) => {
          const parsedInput = moneyFlowAccountInputSchema.safeParse(input);

          if (!parsedInput.success) {
            return { accounts: state.accounts };
          }

          return {
            accounts: sortMoneyFlowAccounts(
              state.accounts.map((account) =>
                account.id === id
                  ? {
                      ...account,
                      ...parsedInput.data,
                      updatedAt: dayjs().toISOString()
                    }
                  : account
              )
            )
          };
        }),
      deleteAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((account) => account.id !== id),
          rules: state.rules.filter(
            (rule) => rule.fromAccountId !== id && rule.toAccountId !== id
          ),
          transfers: state.transfers.filter(
            (transfer) => transfer.fromAccountId !== id && transfer.toAccountId !== id
          )
        })),
      moveAccount: (id, direction) =>
        set((state) => ({
          accounts: sortMoneyFlowAccounts(
            reorderByCreatedAt(state.accounts, id, direction) as MoneyFlowAccount[]
          )
        })),
      addRule: (input) =>
        set((state) => {
          const parsedInput = moneyFlowRuleInputSchema.safeParse(input);

          if (!parsedInput.success) {
            return { rules: state.rules };
          }

          if (
            parsedInput.data.amountType === "remainder" &&
            state.rules.some(
              (rule) =>
                rule.ownerScope === parsedInput.data.ownerScope &&
                rule.fromAccountId === parsedInput.data.fromAccountId &&
                rule.amountType === "remainder" &&
                rule.isActive
            )
          ) {
            return { rules: state.rules };
          }

          const now = dayjs().toISOString();
          const nextOrder =
            Math.max(
              0,
              ...state.rules
                .filter((rule) => rule.ownerScope === parsedInput.data.ownerScope)
                .map((rule) => rule.order)
            ) + 1;

          return {
            rules: sortMoneyFlowRules([
              ...state.rules,
              {
                id: nanoid(),
                ...parsedInput.data,
                order: nextOrder,
                createdAt: now,
                updatedAt: now
              }
            ])
          };
        }),
      updateRule: (id, input) =>
        set((state) => {
          const parsedInput = moneyFlowRuleInputSchema.safeParse(input);

          if (!parsedInput.success) {
            return { rules: state.rules };
          }

          if (
            parsedInput.data.amountType === "remainder" &&
            state.rules.some(
              (rule) =>
                rule.id !== id &&
                rule.ownerScope === parsedInput.data.ownerScope &&
                rule.fromAccountId === parsedInput.data.fromAccountId &&
                rule.amountType === "remainder" &&
                rule.isActive
            )
          ) {
            return { rules: state.rules };
          }

          return {
            rules: sortMoneyFlowRules(
              state.rules.map((rule) =>
                rule.id === id
                  ? {
                      ...rule,
                      ...parsedInput.data,
                      updatedAt: dayjs().toISOString()
                    }
                  : rule
              )
            )
          };
        }),
      deleteRule: (id) =>
        set((state) => ({
          rules: state.rules.filter((rule) => rule.id !== id),
          monthlyEntries: state.monthlyEntries.filter((entry) => entry.ruleId !== id),
          transfers: state.transfers.map((transfer) =>
            transfer.sourceRuleId === id ? { ...transfer, sourceRuleId: undefined } : transfer
          )
        })),
      moveRule: (id, direction) =>
        set((state) => {
          const rules = sortMoneyFlowRules(state.rules);
          const ownerScope = rules.find((rule) => rule.id === id)?.ownerScope;
          const scopedRules = rules.filter((rule) => rule.ownerScope === ownerScope);
          const index = scopedRules.findIndex((rule) => rule.id === id);

          if (index === -1) {
            return { rules };
          }

          const targetIndex = direction === "up" ? index - 1 : index + 1;

          if (targetIndex < 0 || targetIndex >= scopedRules.length) {
            return { rules };
          }

          const currentRule = scopedRules[index];
          const targetRule = scopedRules[targetIndex];

          if (!currentRule || !targetRule) {
            return { rules };
          }

          return {
            rules: sortMoneyFlowRules(
              rules.map((rule) => {
                if (rule.id === currentRule.id) {
                  return { ...rule, order: targetRule.order };
                }

                if (rule.id === targetRule.id) {
                  return { ...rule, order: currentRule.order };
                }

                return rule;
              })
            )
          };
        }),
      updateMonthlyEntry: (id, input) =>
        set((state) => {
          const parsedInput = moneyFlowMonthlyEntryUpdateSchema.safeParse(input);

          if (!parsedInput.success) {
            return { monthlyEntries: state.monthlyEntries };
          }

          return {
            monthlyEntries: sortMoneyFlowMonthlyEntries(
              state.monthlyEntries.map((entry) =>
                entry.id === id
                  ? {
                      ...entry,
                      ...parsedInput.data,
                      checkedAt:
                        parsedInput.data.isChecked === undefined
                          ? entry.checkedAt
                          : parsedInput.data.isChecked
                            ? dayjs().toISOString()
                            : undefined,
                      updatedAt: dayjs().toISOString()
                    }
                  : entry
              )
            )
          };
        }),
      addTransfer: (input) =>
        set((state) => {
          const parsedInput = moneyFlowTransferInputSchema.safeParse(input);

          if (!parsedInput.success) {
            return { transfers: state.transfers };
          }

          const snapshotExists = state.snapshots.some(
            (snapshot) => snapshot.id === parsedInput.data.snapshotId
          );

          if (!snapshotExists) {
            return { transfers: state.transfers };
          }

          const now = dayjs().toISOString();
          const snapshotTransfers = state.transfers.filter(
            (transfer) => transfer.snapshotId === parsedInput.data.snapshotId
          );
          const nextOrder =
            Math.max(0, ...snapshotTransfers.map((transfer) => transfer.order)) + 1;

          return {
            transfers: sortMoneyFlowTransfers([
              ...state.transfers,
              {
                id: nanoid(),
                ...parsedInput.data,
                actualAmount:
                  parsedInput.data.actualAmount ??
                  (parsedInput.data.amountType === "remainder"
                    ? undefined
                    : parsedInput.data.plannedAmount),
                order: nextOrder,
                isOneOff: true,
                isChecked: false,
                createdAt: now,
                updatedAt: now
              }
            ])
          };
        }),
      updateTransfer: (id, input) =>
        set((state) => {
          const parsedInput = moneyFlowTransferUpdateSchema.safeParse(input);

          if (!parsedInput.success) {
            return { transfers: state.transfers };
          }

          return {
            transfers: sortMoneyFlowTransfers(
              state.transfers.map((transfer) =>
                transfer.id === id
                  ? {
                      ...transfer,
                      ...parsedInput.data,
                      checkedAt:
                        parsedInput.data.isChecked === undefined
                          ? transfer.checkedAt
                          : parsedInput.data.isChecked
                            ? dayjs().toISOString()
                            : undefined,
                      updatedAt: dayjs().toISOString()
                    }
                  : transfer
              )
            )
          };
        }),
      deleteTransfer: (id) =>
        set((state) => ({
          transfers: state.transfers.filter(
            (transfer) => transfer.id !== id || !transfer.isOneOff
          )
        })),
      moveTransfer: (id, direction) =>
        set((state) => {
          const transfer = state.transfers.find((candidate) => candidate.id === id);

          if (!transfer) {
            return { transfers: state.transfers };
          }

          const snapshotTransfers = sortMoneyFlowTransfers(
            state.transfers.filter((candidate) => candidate.snapshotId === transfer.snapshotId)
          );
          const index = snapshotTransfers.findIndex((candidate) => candidate.id === id);
          const targetIndex = direction === "up" ? index - 1 : index + 1;

          if (index === -1 || targetIndex < 0 || targetIndex >= snapshotTransfers.length) {
            return { transfers: state.transfers };
          }

          const currentTransfer = snapshotTransfers[index];
          const targetTransfer = snapshotTransfers[targetIndex];

          if (!currentTransfer || !targetTransfer) {
            return { transfers: state.transfers };
          }

          const now = dayjs().toISOString();

          return {
            transfers: sortMoneyFlowTransfers(
              state.transfers.map((candidate) => {
                if (candidate.id === currentTransfer.id) {
                  return {
                    ...candidate,
                    order: targetTransfer.order,
                    updatedAt: now
                  };
                }

                if (candidate.id === targetTransfer.id) {
                  return {
                    ...candidate,
                    order: currentTransfer.order,
                    updatedAt: now
                  };
                }

                return candidate;
              })
            )
          };
        }),
      startMonthlyFlow: (ownerScope, monthKey = getCurrentMoneyFlowMonthKey()) =>
        set((state) => {
          if (
            state.snapshots.some(
              (snapshot) => snapshot.ownerScope === ownerScope && snapshot.monthKey === monthKey
            )
          ) {
            return {
              snapshots: state.snapshots,
              transfers: state.transfers
            };
          }

          const scopedRules = state.rules.filter((rule) => rule.ownerScope === ownerScope);
          const { snapshot, transfers } = buildMoneyFlowSnapshotFromRules({
            ownerScope,
            monthKey,
            rules: scopedRules
          });

          return {
            snapshots: sortMoneyFlowSnapshots([...state.snapshots, snapshot]),
            transfers: sortMoneyFlowTransfers([...state.transfers, ...transfers])
          };
        }),
      copySnapshotToMonth: (sourceSnapshotId, targetMonthKey) =>
        set((state) => {
          const sourceSnapshot = state.snapshots.find(
            (snapshot) => snapshot.id === sourceSnapshotId
          );

          if (!sourceSnapshot) {
            return {
              snapshots: state.snapshots,
              transfers: state.transfers
            };
          }

          if (
            state.snapshots.some(
              (snapshot) =>
                snapshot.ownerScope === sourceSnapshot.ownerScope &&
                snapshot.monthKey === targetMonthKey
            )
          ) {
            return {
              snapshots: state.snapshots,
              transfers: state.transfers
            };
          }

          const sourceTransfers = state.transfers.filter(
            (transfer) => transfer.snapshotId === sourceSnapshot.id
          );
          const { snapshot, transfers } = buildMoneyFlowSnapshotCopy({
            sourceSnapshot,
            sourceTransfers,
            targetMonthKey
          });

          return {
            snapshots: sortMoneyFlowSnapshots([...state.snapshots, snapshot]),
            transfers: sortMoneyFlowTransfers([...state.transfers, ...transfers])
          };
        }),
      resetMoneyFlow: () =>
        set({
          accounts: sortMoneyFlowAccounts(initialAccounts),
          rules: sortMoneyFlowRules(initialRules),
          monthlyEntries: sortMoneyFlowMonthlyEntries(initialMonthlyEntries),
          snapshots: sortMoneyFlowSnapshots(initialSnapshots),
          transfers: sortMoneyFlowTransfers(initialTransfers)
        })
    }),
    {
      name: "heeby-money-flow-store",
      version: 4,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState, version) => {
        if (!persistedState || typeof persistedState !== "object") {
          return {
            accounts: sortMoneyFlowAccounts(initialAccounts),
            rules: sortMoneyFlowRules(initialRules),
            monthlyEntries: sortMoneyFlowMonthlyEntries(initialMonthlyEntries),
            snapshots: sortMoneyFlowSnapshots(initialSnapshots),
            transfers: sortMoneyFlowTransfers(initialTransfers)
          };
        }

        const state = persistedState as Partial<MoneyFlowStore>;

        if (version < 2) {
          return {
            accounts: sortMoneyFlowAccounts(withDefaultAccountOwners(state.accounts ?? initialAccounts)),
            rules: sortMoneyFlowRules(withDefaultRuleOwners(state.rules ?? initialRules)),
            monthlyEntries: sortMoneyFlowMonthlyEntries(withDefaultMonthlyEntryOwners(state.monthlyEntries ?? initialMonthlyEntries)),
            snapshots: sortMoneyFlowSnapshots(withDefaultSnapshotOwners(state.snapshots ?? initialSnapshots)),
            transfers: sortMoneyFlowTransfers(state.transfers ?? initialTransfers)
          };
        }

        if (version < 3) {
          return {
            ...state,
            accounts: sortMoneyFlowAccounts(withDefaultAccountOwners(state.accounts ?? initialAccounts)),
            rules: sortMoneyFlowRules(withDefaultRuleOwners(state.rules ?? initialRules)),
            monthlyEntries: sortMoneyFlowMonthlyEntries(withDefaultMonthlyEntryOwners(state.monthlyEntries ?? initialMonthlyEntries)),
            snapshots: sortMoneyFlowSnapshots(withDefaultSnapshotOwners(state.snapshots ?? initialSnapshots)),
            transfers: sortMoneyFlowTransfers(state.transfers ?? initialTransfers)
          };
        }

        return {
          ...state,
          accounts: sortMoneyFlowAccounts(withDefaultAccountOwners(state.accounts ?? initialAccounts)),
          rules: sortMoneyFlowRules(withDefaultRuleOwners(state.rules ?? initialRules)),
          monthlyEntries: sortMoneyFlowMonthlyEntries(withDefaultMonthlyEntryOwners(state.monthlyEntries ?? initialMonthlyEntries)),
          snapshots: sortMoneyFlowSnapshots(withDefaultSnapshotOwners(state.snapshots ?? initialSnapshots)),
          transfers: sortMoneyFlowTransfers(state.transfers ?? initialTransfers)
        } as MoneyFlowStore;
      }
    }
  )
);

function withDefaultAccountOwners(accounts: MoneyFlowAccount[]) {
  return accounts.map((account) => ({
    ...account,
    ownerScope: account.ownerScope ?? "yumja"
  }));
}

function withDefaultRuleOwners(rules: MoneyFlowRule[]) {
  return rules.map((rule) => ({
    ...rule,
    ownerScope: rule.ownerScope ?? "yumja"
  }));
}

function withDefaultMonthlyEntryOwners(entries: MoneyFlowMonthlyEntry[]) {
  return entries.map((entry) => ({
    ...entry,
    ownerScope: entry.ownerScope ?? "yumja"
  }));
}

function withDefaultSnapshotOwners(snapshots: MoneyFlowSnapshot[]) {
  return snapshots.map((snapshot) => ({
    ...snapshot,
    ownerScope: snapshot.ownerScope ?? "yumja"
  }));
}
