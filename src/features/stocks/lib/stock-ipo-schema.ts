import { z } from "zod";
import { ownerScopeValues } from "@/types/domain";

export const stockIpoDraftRowSchema = z.object({
  id: z.string(),
  ownerScope: z.enum(ownerScopeValues, {
    message: "대상을 선택해주세요."
  }),
  stockName: z.string().trim().min(1, "공모주 이름을 입력해주세요.").max(40, "공모주 이름은 40자 이하로 입력해주세요."),
  brokerage: z.string().trim().min(1, "증권사를 입력해주세요.").max(32, "증권사는 32자 이하로 입력해주세요."),
  subscribedAt: z.string().min(1, "청약일을 입력해주세요."),
  deposit: z.string().trim().min(1, "증거금을 입력해주세요.").refine((value) => Number(value) >= 0, "증거금은 0 이상이어야 합니다."),
  allocatedQuantity: z.string().trim().min(1, "배정수량을 입력해주세요.").refine((value) => Number(value) >= 0, "배정수량은 0 이상이어야 합니다."),
  refundedAt: z.string().trim(),
  refundAmount: z.string().trim().refine((value) => value === "" || Number(value) >= 0, "환불금은 비워두거나 0 이상이어야 합니다."),
  subscriptionFee: z.string().trim().refine((value) => value === "" || Number(value) >= 0, "청약 수수료는 비워두거나 0 이상이어야 합니다."),
  listedAt: z.string().trim(),
  sellAmount: z.string().trim().refine((value) => value === "" || Number(value) >= 0, "매도액은 비워두거나 0 이상이어야 합니다."),
  settledAt: z.string().trim(),
  taxAndFee: z.string().trim().refine((value) => value === "" || Number(value) >= 0, "세금 + 수수료는 비워두거나 0 이상이어야 합니다.")
});

export const stockIpoBatchSchema = z.object({
  entries: z.array(stockIpoDraftRowSchema).min(1, "최소 1개 공모주 기록을 입력해주세요.")
});

export type StockIpoBatchValues = z.infer<typeof stockIpoBatchSchema>;
