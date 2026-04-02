export const routineRepeatTypes = [
  "yearly",
  "monthly",
  "weekly",
  "daily",
  "once"
] as const;

export const routineChannelTypes = ["telegram"] as const;

export type RoutineRepeatType = (typeof routineRepeatTypes)[number];
export type RoutineChannelType = (typeof routineChannelTypes)[number];

type RoutineBase = {
  id: string;
  title: string;
  message: string;
  repeatType: RoutineRepeatType;
  time: string;
  isActive: boolean;
  channel: RoutineChannelType;
  createdAt: string;
  updatedAt: string;
};

export type OnceRoutine = RoutineBase & {
  repeatType: "once";
  scheduledDate: string;
};

export type DailyRoutine = RoutineBase & {
  repeatType: "daily";
};

export type WeeklyRoutine = RoutineBase & {
  repeatType: "weekly";
  dayOfWeek: number;
};

export type MonthlyRoutine = RoutineBase & {
  repeatType: "monthly";
  dayOfMonth: number;
};

export type YearlyRoutine = RoutineBase & {
  repeatType: "yearly";
  month: number;
  dayOfMonth: number;
};

export type Routine =
  | OnceRoutine
  | DailyRoutine
  | WeeklyRoutine
  | MonthlyRoutine
  | YearlyRoutine;
