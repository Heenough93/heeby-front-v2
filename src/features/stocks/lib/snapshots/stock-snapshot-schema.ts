import { z } from "zod";
import { stockMarketValues } from "@/features/stocks/lib/shared/stock-core-types";
import {
  stockSnapshotScopeValues,
  type StockSnapshotEditorValues
} from "@/features/stocks/lib/snapshots/stock-snapshot-types";

export const stockSnapshotDraftItemSchema = z.object({
  id: z.string(),
  stockId: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(1, "종목 이름을 입력해주세요.")
    .max(40, "종목 이름은 40자 이하로 입력해주세요."),
  ticker: z
    .string()
    .trim()
    .min(1, "티커를 입력해주세요.")
    .max(16, "티커는 16자 이하로 입력해주세요."),
  market: z.enum(stockMarketValues, {
    message: "시장을 선택해주세요."
  }),
  sector: z
    .string()
    .trim()
    .max(32, "산업은 32자 이하로 입력해주세요.")
    .optional(),
  marketCap: z
    .string()
    .trim()
    .max(24, "시총 표기는 24자 이하로 입력해주세요.")
    .optional(),
  price: z
    .string()
    .trim()
    .max(24, "현재가 표기는 24자 이하로 입력해주세요.")
    .optional(),
  note: z
    .string()
    .trim()
    .max(120, "메모는 120자 이하로 입력해주세요.")
    .optional()
});

export const stockSnapshotEditorSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "스냅샷 제목을 입력해주세요.")
    .max(60, "스냅샷 제목은 60자 이하로 입력해주세요."),
  weekKey: z
    .string()
    .trim()
    .regex(/^\d{4}-W\d{2}$/, "주차는 YYYY-W## 형식으로 입력해주세요."),
  marketScope: z.enum(stockSnapshotScopeValues, {
    message: "스냅샷 시장을 선택해주세요."
  }),
  comment: z
    .string()
    .trim()
    .max(180, "한 줄 총평은 180자 이하로 입력해주세요.")
    .optional(),
  sourceSnapshotId: z.string().optional(),
  items: z.array(stockSnapshotDraftItemSchema).min(1, "최소 1개 종목을 추가해주세요.")
}).superRefine((value, ctx) => {
  const invalidItem = value.items.find((item) => item.market !== value.marketScope);

  if (!invalidItem) {
    return;
  }

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: ["items"],
    message: "스냅샷 시장과 다른 종목은 추가할 수 없습니다."
  });
});

export type StockSnapshotEditorSchemaValues = z.infer<
  typeof stockSnapshotEditorSchema
>;

export function parseStockSnapshotValues(values: StockSnapshotEditorValues) {
  return stockSnapshotEditorSchema.parse(values);
}
