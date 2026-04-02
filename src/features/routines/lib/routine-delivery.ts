import type { Routine } from "@/features/routines/lib/routine-types";

type ZonedDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: number;
};

const weekdayMap = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6
} as const;

export function getRoutineTimeZone() {
  return process.env.ROUTINE_TIME_ZONE?.trim() || "Asia/Seoul";
}

function getZonedDateParts(date: Date, timeZone: string): ZonedDateParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: Number(getPart("year")),
    month: Number(getPart("month")),
    day: Number(getPart("day")),
    hour: Number(getPart("hour")),
    minute: Number(getPart("minute")),
    weekday: weekdayMap[getPart("weekday") as keyof typeof weekdayMap]
  };
}

function isSameRoutineTime(routine: Routine, parts: ZonedDateParts) {
  const [hour, minute] = routine.time.split(":").map(Number);

  return parts.hour === hour && parts.minute === minute;
}

export function isRoutineDueAt(
  routine: Routine,
  referenceDate: Date,
  timeZone = getRoutineTimeZone()
) {
  if (!routine.isActive) {
    return false;
  }

  const parts = getZonedDateParts(referenceDate, timeZone);

  if (!isSameRoutineTime(routine, parts)) {
    return false;
  }

  switch (routine.repeatType) {
    case "daily":
      return true;
    case "weekly":
      return parts.weekday === routine.dayOfWeek;
    case "monthly":
      return parts.day === routine.dayOfMonth;
    case "yearly":
      return parts.month === routine.month && parts.day === routine.dayOfMonth;
    case "once": {
      const [year, month, day] = routine.scheduledDate.split("-").map(Number);

      return parts.year === year && parts.month === month && parts.day === day;
    }
  }
}

export function buildRoutineTelegramMessage(routine: Routine) {
  return [`[${routine.title}]`, routine.message].join("\n");
}
