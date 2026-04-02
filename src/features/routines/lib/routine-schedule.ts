import dayjs from "dayjs";
import type { Routine } from "@/features/routines/lib/routine-types";

const dayOfWeekLabels = [
  "일요일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일"
] as const;

export function getRoutineRepeatLabel(routine: Routine) {
  switch (routine.repeatType) {
    case "daily":
      return `매일 ${routine.time}`;
    case "weekly":
      return `매주 ${dayOfWeekLabels[routine.dayOfWeek]} ${routine.time}`;
    case "monthly":
      return `매달 ${routine.dayOfMonth}일 ${routine.time}`;
    case "yearly":
      return `매년 ${routine.month}월 ${routine.dayOfMonth}일 ${routine.time}`;
    case "once":
      return `${dayjs(`${routine.scheduledDate}T${routine.time}`).format("YYYY.MM.DD HH:mm")} 1회`;
  }
}

export function getRoutineNextRunHint(routine: Routine) {
  if (!routine.isActive) {
    return "비활성";
  }

  if (routine.repeatType === "once") {
    return `예정일 ${dayjs(routine.scheduledDate).format("YYYY.MM.DD")}`;
  }

  return getRoutineRepeatLabel(routine);
}
