import { z } from "zod";
import { themeValues } from "@/types/domain";

export const templateFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "템플릿 이름을 입력해주세요.")
    .max(40, "템플릿 이름은 40자 이하로 입력해주세요."),
  theme: z.enum(themeValues, {
    errorMap: () => ({ message: "주제를 선택해주세요." })
  }),
  questions: z
    .array(
      z.object({
        value: z
          .string()
          .trim()
          .min(1, "질문 내용을 입력해주세요.")
          .max(80, "질문은 80자 이하로 입력해주세요.")
      })
    )
    .min(3, "질문은 최소 3개가 필요합니다.")
    .max(7, "질문은 최대 7개까지 입력할 수 있습니다.")
});

export type TemplateFormValues = z.infer<typeof templateFormSchema>;
