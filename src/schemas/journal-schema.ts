import { z } from "zod";
import { themeValues } from "@/types/domain";

export const journalFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "기록 제목을 입력해주세요.")
    .max(60, "기록 제목은 60자 이하로 입력해주세요."),
  theme: z.enum(themeValues, {
    errorMap: () => ({ message: "주제를 선택해주세요." })
  }),
  templateId: z.string().trim().min(1, "템플릿을 선택해주세요."),
  answers: z
    .array(
      z.object({
        question: z.string().trim().min(1),
        answer: z
          .string()
          .trim()
          .min(1, "답변을 입력해주세요.")
          .max(2000, "답변은 2000자 이하로 입력해주세요.")
      })
    )
    .min(1, "최소 1개 이상의 질문이 필요합니다.")
});

export type JournalFormValues = z.infer<typeof journalFormSchema>;
