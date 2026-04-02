import type { RoutineFormValues } from "@/features/routines/lib/routine-schema";
import type { Routine } from "@/features/routines/lib/routine-types";

export const defaultRoutineFormValues: RoutineFormValues = {
  title: "",
  message: "",
  repeatType: "weekly",
  time: "09:00",
  isActive: true,
  channel: "telegram",
  dayOfWeek: 0,
  dayOfMonth: 1,
  month: 1,
  scheduledDate: ""
};

export function getRoutineFormValues(routine: Routine): RoutineFormValues {
  return {
    title: routine.title,
    message: routine.message,
    repeatType: routine.repeatType,
    time: routine.time,
    isActive: routine.isActive,
    channel: routine.channel,
    dayOfWeek: "dayOfWeek" in routine ? routine.dayOfWeek : 0,
    dayOfMonth: "dayOfMonth" in routine ? routine.dayOfMonth : 1,
    month: "month" in routine ? routine.month : 1,
    scheduledDate: "scheduledDate" in routine ? routine.scheduledDate : ""
  };
}
