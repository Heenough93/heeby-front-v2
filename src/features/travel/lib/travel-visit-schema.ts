import { z } from "zod";

export const travelVisitFormSchema = z
  .object({
    city: z
      .string()
      .trim()
      .min(1, "도시 이름을 입력해주세요.")
      .max(40, "도시 이름은 40자 이하로 입력해주세요."),
    country: z
      .string()
      .trim()
      .min(1, "국가 이름을 입력해주세요.")
      .max(40, "국가 이름은 40자 이하로 입력해주세요."),
    latitude: z.coerce
      .number()
      .min(-90, "위도는 -90 이상이어야 합니다.")
      .max(90, "위도는 90 이하여야 합니다."),
    longitude: z.coerce
      .number()
      .min(-180, "경도는 -180 이상이어야 합니다.")
      .max(180, "경도는 180 이하여야 합니다."),
    startedAt: z.string().min(1, "방문 시작일을 입력해주세요."),
    endedAt: z.string().optional(),
    note: z
      .string()
      .trim()
      .max(180, "메모는 180자 이하로 입력해주세요.")
      .optional()
  })
  .refine(
    (value) => !value.endedAt || value.endedAt >= value.startedAt,
    {
      message: "종료일은 시작일보다 빠를 수 없습니다.",
      path: ["endedAt"]
    }
  );

export type TravelVisitFormValues = z.infer<typeof travelVisitFormSchema>;
