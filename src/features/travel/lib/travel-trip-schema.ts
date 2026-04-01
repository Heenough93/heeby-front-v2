import { z } from "zod";
import { contentVisibilityValues } from "@/types/domain";

export const travelTripFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "여행 이름을 입력해주세요.")
    .max(40, "여행 이름은 40자 이하로 입력해주세요."),
  visibility: z.enum(contentVisibilityValues, {
    message: "공개 범위를 선택해주세요."
  }),
  note: z
    .string()
    .trim()
    .max(180, "설명은 180자 이하로 입력해주세요.")
    .optional()
});

export type TravelTripFormValues = z.infer<typeof travelTripFormSchema>;
