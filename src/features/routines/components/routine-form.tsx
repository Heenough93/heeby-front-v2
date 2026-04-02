"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  defaultRoutineFormValues,
  getRoutineFormValues
} from "@/features/routines/lib/routine-form-values";
import {
  routineFormSchema,
  type RoutineFormValues
} from "@/features/routines/lib/routine-schema";
import type { Routine } from "@/features/routines/lib/routine-types";
import { cn } from "@/lib/utils";

type RoutineFormProps = {
  onSubmit: (values: RoutineFormValues) => void;
  routine?: Routine;
  className?: string;
  submitLabel?: string;
};

const dayOfWeekOptions = [
  { value: 0, label: "일요일" },
  { value: 1, label: "월요일" },
  { value: 2, label: "화요일" },
  { value: 3, label: "수요일" },
  { value: 4, label: "목요일" },
  { value: 5, label: "금요일" },
  { value: 6, label: "토요일" }
] as const;

export function RoutineForm({
  onSubmit,
  routine,
  className,
  submitLabel = "루틴 저장"
}: RoutineFormProps) {
  const form = useForm<RoutineFormValues>({
    resolver: zodResolver(routineFormSchema),
    defaultValues: routine ? getRoutineFormValues(routine) : defaultRoutineFormValues
  });
  const repeatType = useWatch({
    control: form.control,
    name: "repeatType"
  });

  useEffect(() => {
    form.reset(routine ? getRoutineFormValues(routine) : defaultRoutineFormValues);
  }, [form, routine]);

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values);
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className={cn(
        "grid gap-6 rounded-[28px] border border-line/10 bg-surface p-6 shadow-card md:p-8",
        className
      )}
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
          {routine ? "Edit Routine" : "Add Routine"}
        </p>
        <h2 className="mt-2 text-2xl font-bold">{routine ? "루틴 수정" : "루틴 추가"}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="루틴 제목" error={form.formState.errors.title?.message}>
          <input
            {...form.register("title")}
            placeholder="예: 주간 시총 점검"
            className={inputClassName}
          />
        </Field>

        <Field label="반복 방식" error={form.formState.errors.repeatType?.message}>
          <select {...form.register("repeatType")} className={inputClassName}>
            <option value="yearly">매년</option>
            <option value="monthly">매달</option>
            <option value="weekly">매주</option>
            <option value="daily">매일</option>
            <option value="once">한번</option>
          </select>
        </Field>
      </div>

      <Field label="텔레그램 메시지" error={form.formState.errors.message?.message}>
        <textarea
          {...form.register("message")}
          rows={4}
          placeholder="정해진 시간에 보낼 메시지를 입력합니다."
          className={cn(inputClassName, "min-h-28 resize-y py-3")}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="시간" error={form.formState.errors.time?.message}>
          <input type="time" {...form.register("time")} className={inputClassName} />
        </Field>

        <Field label="채널">
          <input value="Telegram" readOnly className={cn(inputClassName, "text-ink/60")} />
        </Field>
      </div>

      {repeatType === "weekly" ? (
        <Field label="요일" error={form.formState.errors.dayOfWeek?.message}>
          <select
            {...form.register("dayOfWeek", { valueAsNumber: true })}
            className={inputClassName}
          >
            {dayOfWeekOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {repeatType === "monthly" ? (
        <Field label="매달 날짜" error={form.formState.errors.dayOfMonth?.message}>
          <input
            type="number"
            min={1}
            max={31}
            {...form.register("dayOfMonth", { valueAsNumber: true })}
            className={inputClassName}
          />
        </Field>
      ) : null}

      {repeatType === "yearly" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="월" error={form.formState.errors.month?.message}>
            <input
              type="number"
              min={1}
              max={12}
              {...form.register("month", { valueAsNumber: true })}
              className={inputClassName}
            />
          </Field>
          <Field label="일" error={form.formState.errors.dayOfMonth?.message}>
            <input
              type="number"
              min={1}
              max={31}
              {...form.register("dayOfMonth", { valueAsNumber: true })}
              className={inputClassName}
            />
          </Field>
        </div>
      ) : null}

      {repeatType === "once" ? (
        <Field label="실행 날짜" error={form.formState.errors.scheduledDate?.message}>
          <input type="date" {...form.register("scheduledDate")} className={inputClassName} />
        </Field>
      ) : null}

      <label className="flex items-center gap-3 rounded-[22px] border border-line/10 bg-paper px-4 py-4">
        <input type="checkbox" {...form.register("isActive")} className="h-4 w-4" />
        <span className="text-sm font-semibold text-ink/75">루틴 활성화</span>
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

const inputClassName =
  "h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-surface";

type FieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
};

function Field({ label, error, children }: FieldProps) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-ink/75">{label}</span>
      {children}
      {error ? <span className="text-sm text-red-600">{error}</span> : null}
    </label>
  );
}
