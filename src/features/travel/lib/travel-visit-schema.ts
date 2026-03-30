import { z } from "zod";

const coordinateField = (
  fieldName: "위도" | "경도",
  min: number,
  max: number
) =>
  z.coerce
    .number({
      invalid_type_error: `${fieldName}에 유효한 숫자를 입력해주세요.`
    })
    .min(min, `${fieldName}는 ${min} 이상이어야 합니다.`)
    .max(max, `${fieldName}는 ${max} 이하여야 합니다.`)
    .refine((value) => Number.isFinite(value), {
      message: `${fieldName}에 유효한 숫자를 입력해주세요.`
    });

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
    latitude: coordinateField("위도", -90, 90),
    longitude: coordinateField("경도", -180, 180),
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
