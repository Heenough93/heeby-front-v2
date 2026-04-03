import { z } from "zod";
import {
  stockMarketValues,
  stockTradeAccountTypeValues,
  stockTradeSideValues
} from "@/features/stocks/lib/stock-types";

export const stockTradeDraftRowSchema = z.object({
  id: z.string(),
  tradedAt: z.string().min(1, "거래일을 입력해주세요."),
  accountName: z
    .string()
    .trim()
    .min(1, "계좌명을 입력해주세요.")
    .max(32, "계좌명은 32자 이하로 입력해주세요."),
  accountType: z.enum(stockTradeAccountTypeValues),
  stockName: z
    .string()
    .trim()
    .min(1, "종목명을 입력해주세요.")
    .max(40, "종목명은 40자 이하로 입력해주세요."),
  ticker: z
    .string()
    .trim()
    .min(1, "티커를 입력해주세요.")
    .max(16, "티커는 16자 이하로 입력해주세요."),
  market: z.enum(stockMarketValues),
  side: z.enum(stockTradeSideValues),
  quantity: z
    .string()
    .trim()
    .min(1, "수량을 입력해주세요.")
    .refine((value) => Number(value) > 0, "수량은 0보다 커야 합니다."),
  price: z
    .string()
    .trim()
    .min(1, "단가를 입력해주세요.")
    .refine((value) => Number(value) > 0, "단가는 0보다 커야 합니다."),
  exchangeRate: z.string().trim(),
  fee: z
    .string()
    .trim()
    .refine((value) => value === "" || Number(value) >= 0, "수수료는 0 이상이어야 합니다."),
  note: z
    .string()
    .trim()
    .max(120, "메모는 120자 이하로 입력해주세요.")
}).superRefine((value, ctx) => {
  if (value.market !== "US") {
    return;
  }

  if (value.exchangeRate === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["exchangeRate"],
      message: "미국 거래는 환율을 입력해주세요."
    });
    return;
  }

  if (Number(value.exchangeRate) <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["exchangeRate"],
      message: "환율은 0보다 커야 합니다."
    });
  }
});

export const stockTradeBatchSchema = z.object({
  entries: z.array(stockTradeDraftRowSchema).min(1, "최소 1개 거래를 입력해주세요.")
});

export type StockTradeBatchValues = z.infer<typeof stockTradeBatchSchema>;
