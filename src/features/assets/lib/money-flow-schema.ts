import { z } from "zod";
import {
  moneyFlowAccountRoleValues,
  moneyFlowRuleTypeValues
} from "@/features/assets/lib/money-flow-types";

const moneyFlowAmountSchema = z.number().finite().min(0, "금액은 0 이상이어야 합니다.");

const optionalMoneyFlowTextSchema = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .optional();

export const moneyFlowAccountInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "통장 이름을 입력해주세요.")
    .max(40, "통장 이름은 40자 이하로 입력해주세요."),
  role: z.enum(moneyFlowAccountRoleValues),
  bankName: optionalMoneyFlowTextSchema(40, "은행명은 40자 이하로 입력해주세요."),
  currentBalance: moneyFlowAmountSchema,
  targetAmount: moneyFlowAmountSchema.optional(),
  isActive: z.boolean(),
  note: optionalMoneyFlowTextSchema(120, "메모는 120자 이하로 입력해주세요.")
});

const moneyFlowRuleInputBaseSchema = z.object({
  fromAccountId: z.string().trim().min(1, "출발 계좌를 선택해주세요."),
  toAccountId: z.string().trim().min(1, "도착 계좌를 선택해주세요."),
  amountType: z.enum(moneyFlowRuleTypeValues),
  amount: moneyFlowAmountSchema,
  isActive: z.boolean(),
  note: optionalMoneyFlowTextSchema(120, "메모는 120자 이하로 입력해주세요.")
});

function refineMoneyFlowRuleAccounts(
  value: z.infer<typeof moneyFlowRuleInputBaseSchema>,
  context: z.RefinementCtx
) {
    if (value.fromAccountId === value.toAccountId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["toAccountId"],
        message: "출발 계좌와 도착 계좌는 달라야 합니다."
      });
    }
}

export const moneyFlowRuleInputSchema = moneyFlowRuleInputBaseSchema.superRefine(refineMoneyFlowRuleAccounts);

export const moneyFlowRuleSchema = moneyFlowRuleInputBaseSchema
  .extend({
    id: z.string().trim().min(1),
    order: z.number().int().min(0),
    createdAt: z.string().trim().min(1),
    updatedAt: z.string().trim().min(1)
  })
  .superRefine(refineMoneyFlowRuleAccounts);

export const moneyFlowMonthlyEntryUpdateSchema = z.object({
  actualAmount: moneyFlowAmountSchema.optional(),
  memo: optionalMoneyFlowTextSchema(180, "메모는 180자 이하로 입력해주세요."),
  isChecked: z.boolean().optional()
});

export const moneyFlowRuleListSchema = z.array(moneyFlowRuleSchema).superRefine((rules, context) => {
  const activeRemainderRules = rules.filter((rule) => rule.amountType === "remainder" && rule.isActive);

  if (activeRemainderRules.length > 1) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "활성 잔여 규칙은 하나만 둘 수 있습니다."
    });
  }
});

export type MoneyFlowAccountInputSchemaValues = z.infer<typeof moneyFlowAccountInputSchema>;
export type MoneyFlowRuleInputSchemaValues = z.infer<typeof moneyFlowRuleInputSchema>;
