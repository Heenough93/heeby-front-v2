import { z } from "zod";
import { stockMarketValues } from "@/features/stocks/lib/shared/stock-core-types";
import {
  stockTradeAccountTypeValues,
  stockTradePositionStatusValues
} from "@/features/stocks/lib/trades/stock-trade-types";

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
  positionStatus: z.enum(stockTradePositionStatusValues),
  quantity: z
    .string()
    .trim()
    .min(1, "수량을 입력해주세요.")
    .refine((value) => Number(value) > 0, "수량은 0보다 커야 합니다."),
  buyPrice: z
    .string()
    .trim()
    .min(1, "매수가를 입력해주세요.")
    .refine((value) => Number(value) > 0, "매수가는 0보다 커야 합니다."),
  currentPrice: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || Number(value) > 0,
      "현재가는 비워두거나 0보다 크게 입력해주세요."
    ),
  soldAt: z.string().trim(),
  sellPrice: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || Number(value) > 0,
      "매도가는 비워두거나 0보다 크게 입력해주세요."
    ),
  fee: z
    .string()
    .trim()
    .refine((value) => value === "" || Number(value) >= 0, "수수료는 0 이상이어야 합니다."),
  note: z
    .string()
    .trim()
    .max(120, "메모는 120자 이하로 입력해주세요.")
}).superRefine((value, ctx) => {
  if (value.positionStatus === "closed") {
    if (value.soldAt === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["soldAt"],
        message: "매도 완료 상태는 매도일을 입력해주세요."
      });
    }

    if (value.sellPrice === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sellPrice"],
        message: "매도 완료 상태는 매도가를 입력해주세요."
      });
    }

    return;
  }

  if (value.currentPrice === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["currentPrice"],
      message: "보유중 상태는 현재가를 입력해주세요."
    });
  }
});

export const stockTradeBatchSchema = z.object({
  entries: z.array(stockTradeDraftRowSchema).min(1, "최소 1개 거래를 입력해주세요.")
});

export type StockTradeBatchValues = z.infer<typeof stockTradeBatchSchema>;
