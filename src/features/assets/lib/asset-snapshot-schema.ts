import { z } from "zod";
import { ownerScopeValues } from "@/types/domain";
import {
  assetSnapshotCategoryValues,
  assetSnapshotMajorTypeValues,
  type AssetSnapshotEditorValues
} from "@/features/assets/lib/asset-snapshot-types";

export const assetSnapshotDraftItemSchema = z.object({
  id: z.string(),
  ownerScope: z.enum(ownerScopeValues),
  majorType: z.enum(assetSnapshotMajorTypeValues),
  institution: z
    .string()
    .trim()
    .min(1, "기관명을 입력해주세요.")
    .max(40, "기관명은 40자 이하로 입력해주세요."),
  label: z
    .string()
    .trim()
    .min(1, "라벨을 입력해주세요.")
    .max(40, "라벨은 40자 이하로 입력해주세요."),
  category: z.enum(assetSnapshotCategoryValues),
  amount: z
    .string()
    .trim()
    .min(1, "잔액을 입력해주세요.")
    .refine((value) => Number(value) >= 0, "잔액은 0 이상이어야 합니다.")
});

export const assetSnapshotEditorSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "스냅샷 제목을 입력해주세요.")
    .max(60, "스냅샷 제목은 60자 이하로 입력해주세요."),
  monthKey: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}$/, "월은 YYYY-MM 형식으로 입력해주세요."),
  memo: z
    .string()
    .trim()
    .max(180, "메모는 180자 이하로 입력해주세요.")
    .optional(),
  sourceSnapshotId: z.string().optional(),
  items: z.array(assetSnapshotDraftItemSchema).min(1, "최소 1개 항목을 추가해주세요.")
});

export type AssetSnapshotEditorSchemaValues = z.infer<
  typeof assetSnapshotEditorSchema
>;

export function parseAssetSnapshotValues(values: AssetSnapshotEditorValues) {
  return assetSnapshotEditorSchema.parse(values);
}
