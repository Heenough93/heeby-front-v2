import { z } from "zod";
import {
  routineChannelTypes,
  routineRepeatTypes
} from "@/features/routines/lib/routine-types";

const baseRoutineFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "루틴 제목을 입력해주세요.")
    .max(40, "루틴 제목은 40자 이하로 입력해주세요."),
  message: z
    .string()
    .trim()
    .min(1, "텔레그램 메시지를 입력해주세요.")
    .max(300, "메시지는 300자 이하로 입력해주세요."),
  repeatType: z.enum(routineRepeatTypes, {
    errorMap: () => ({ message: "반복 방식을 선택해주세요." })
  }),
  time: z.string().regex(/^\d{2}:\d{2}$/, "시간을 입력해주세요."),
  isActive: z.boolean(),
  channel: z.enum(routineChannelTypes),
  dayOfWeek: z.coerce.number().int().min(0).max(6).optional(),
  dayOfMonth: z.coerce.number().int().min(1).max(31).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  scheduledDate: z.string().optional()
});

export const routineFormSchema = baseRoutineFormSchema.superRefine((value, ctx) => {
  if (value.repeatType === "weekly" && value.dayOfWeek === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["dayOfWeek"],
      message: "요일을 선택해주세요."
    });
  }

  if (value.repeatType === "monthly" && value.dayOfMonth === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["dayOfMonth"],
      message: "매달 반복할 날짜를 입력해주세요."
    });
  }

  if (
    value.repeatType === "yearly" &&
    (value.month === undefined || value.dayOfMonth === undefined)
  ) {
    if (value.month === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["month"],
        message: "월을 입력해주세요."
      });
    }

    if (value.dayOfMonth === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dayOfMonth"],
        message: "일을 입력해주세요."
      });
    }
  }

  if (value.repeatType === "once" && !value.scheduledDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["scheduledDate"],
      message: "실행 날짜를 입력해주세요."
    });
  }
});

export type RoutineFormValues = z.infer<typeof routineFormSchema>;
