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
  MoneyFlowRuleInput
} from "@/features/assets/lib/money-flow-types";
import {
  buildMonthlyEntriesFromRules,
  getCurrentMoneyFlowMonthKey,
  sortMoneyFlowAccounts,
  sortMoneyFlowMonthlyEntries,
  sortMoneyFlowRules
} from "@/features/assets/lib/money-flow-utils";
import {
  moneyFlowAccounts as initialAccounts,
  moneyFlowMonthlyEntries as initialMonthlyEntries,
  moneyFlowRules as initialRules
} from "@/mocks/money-flow";

type MoneyFlowStore = {
  accounts: MoneyFlowAccount[];
  rules: MoneyFlowRule[];
  monthlyEntries: MoneyFlowMonthlyEntry[];
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
  startMonthlyFlow: (monthKey?: string) => void;
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
      addAccount: (input) =>
        set((state) => {
          const now = dayjs().toISOString();

          return {
            accounts: sortMoneyFlowAccounts([
              ...state.accounts,
              {
                id: nanoid(),
                ...input,
                createdAt: now,
                updatedAt: now
              }
            ])
          };
        }),
      updateAccount: (id, input) =>
        set((state) => ({
          accounts: sortMoneyFlowAccounts(
            state.accounts.map((account) =>
              account.id === id
                ? {
                    ...account,
                    ...input,
                    updatedAt: dayjs().toISOString()
                  }
                : account
            )
          )
        })),
      deleteAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((account) => account.id !== id),
          rules: state.rules.filter(
            (rule) => rule.fromAccountId !== id && rule.toAccountId !== id
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
          if (
            input.amountType === "remainder" &&
            state.rules.some((rule) => rule.amountType === "remainder" && rule.isActive)
          ) {
            return { rules: state.rules };
          }

          const now = dayjs().toISOString();
          const nextOrder =
            Math.max(0, ...state.rules.map((rule) => rule.order)) + 1;

          return {
            rules: sortMoneyFlowRules([
              ...state.rules,
              {
                id: nanoid(),
                ...input,
                order: nextOrder,
                createdAt: now,
                updatedAt: now
              }
            ])
          };
        }),
      updateRule: (id, input) =>
        set((state) => {
          if (
            input.amountType === "remainder" &&
            state.rules.some(
              (rule) => rule.id !== id && rule.amountType === "remainder" && rule.isActive
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
                      ...input,
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
          monthlyEntries: state.monthlyEntries.filter((entry) => entry.ruleId !== id)
        })),
      moveRule: (id, direction) =>
        set((state) => {
          const rules = sortMoneyFlowRules(state.rules);
          const index = rules.findIndex((rule) => rule.id === id);

          if (index === -1) {
            return { rules };
          }

          const targetIndex = direction === "up" ? index - 1 : index + 1;

          if (targetIndex < 0 || targetIndex >= rules.length) {
            return { rules };
          }

          const nextRules = [...rules];
          const currentRule = nextRules[index];
          const targetRule = nextRules[targetIndex];

          if (!currentRule || !targetRule) {
            return { rules };
          }

          nextRules[index] = { ...currentRule, order: targetRule.order };
          nextRules[targetIndex] = { ...targetRule, order: currentRule.order };

          return { rules: sortMoneyFlowRules(nextRules) };
        }),
      updateMonthlyEntry: (id, input) =>
        set((state) => ({
          monthlyEntries: sortMoneyFlowMonthlyEntries(
            state.monthlyEntries.map((entry) =>
              entry.id === id
                ? {
                    ...entry,
                    ...input,
                    checkedAt:
                      input.isChecked === undefined
                        ? entry.checkedAt
                        : input.isChecked
                          ? dayjs().toISOString()
                          : undefined,
                    updatedAt: dayjs().toISOString()
                  }
                : entry
            )
          )
        })),
      startMonthlyFlow: (monthKey = getCurrentMoneyFlowMonthKey()) =>
        set((state) => {
          if (state.monthlyEntries.some((entry) => entry.monthKey === monthKey)) {
            return { monthlyEntries: state.monthlyEntries };
          }

          const salaryAmount = state.accounts
            .filter((account) => account.role === "salary" && account.isActive)
            .reduce((sum, account) => sum + account.currentBalance, 0);

          return {
            monthlyEntries: sortMoneyFlowMonthlyEntries([
              ...state.monthlyEntries,
              ...buildMonthlyEntriesFromRules({
                monthKey,
                salaryAmount,
                rules: state.rules,
                accounts: state.accounts
              })
            ])
          };
        }),
      resetMoneyFlow: () =>
        set({
          accounts: sortMoneyFlowAccounts(initialAccounts),
          rules: sortMoneyFlowRules(initialRules),
          monthlyEntries: sortMoneyFlowMonthlyEntries(initialMonthlyEntries)
        })
    }),
    {
      name: "heeby-money-flow-store",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState, version) => {
        if (!persistedState || typeof persistedState !== "object") {
          return {
            accounts: sortMoneyFlowAccounts(initialAccounts),
            rules: sortMoneyFlowRules(initialRules),
            monthlyEntries: sortMoneyFlowMonthlyEntries(initialMonthlyEntries)
          };
        }

        const state = persistedState as Partial<MoneyFlowStore>;

        if (version < 2) {
          return {
            accounts: sortMoneyFlowAccounts(state.accounts ?? initialAccounts),
            rules: sortMoneyFlowRules(state.rules ?? initialRules),
            monthlyEntries: sortMoneyFlowMonthlyEntries(state.monthlyEntries ?? initialMonthlyEntries)
          };
        }

        return persistedState as MoneyFlowStore;
      }
    }
  )
);
