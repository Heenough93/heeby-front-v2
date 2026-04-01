"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  defaultTravelTripFormValues,
  getTravelTripFormValues
} from "@/features/travel/lib/travel-trip-form-values";
import {
  travelTripFormSchema,
  type TravelTripFormValues
} from "@/features/travel/lib/travel-trip-schema";
import type { TravelTrip } from "@/features/travel/lib/travel-types";
import { cn } from "@/lib/utils";

type TravelTripFormProps = {
  onSubmit: (values: TravelTripFormValues) => void;
  trip?: TravelTrip;
  className?: string;
  submitLabel?: string;
};

export function TravelTripForm({
  onSubmit,
  trip,
  className,
  submitLabel = "여행 저장"
}: TravelTripFormProps) {
  const form = useForm<TravelTripFormValues>({
    resolver: zodResolver(travelTripFormSchema),
    defaultValues: trip ? getTravelTripFormValues(trip) : defaultTravelTripFormValues
  });

  useEffect(() => {
    form.reset(trip ? getTravelTripFormValues(trip) : defaultTravelTripFormValues);
  }, [form, trip]);

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values);
    form.reset(trip ? getTravelTripFormValues(trip) : defaultTravelTripFormValues);
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className={cn(
        "grid gap-5 rounded-[28px] border border-line/10 bg-surface p-6 shadow-card",
        className
      )}
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
          {trip ? "Edit Trip" : "Add Trip"}
        </p>
        <h2 className="mt-2 text-2xl font-bold">{trip ? "여행 수정" : "여행 추가"}</h2>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-ink/75">여행 이름</span>
        <input
          {...form.register("name")}
          placeholder="예: 2025 타이베이 주말 이동"
          className={inputClassName}
        />
        {form.formState.errors.name ? (
          <span className="text-sm text-red-600">
            {form.formState.errors.name.message}
          </span>
        ) : null}
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-ink/75">공개 범위</span>
        <select {...form.register("visibility")} className={inputClassName}>
          <option value="private">비공개</option>
          <option value="public">공개</option>
        </select>
        <p className="text-sm text-ink/60">
          여행 공개 여부는 이후 여행 상세 공유 화면의 기본 접근 단위가 됩니다.
        </p>
        {form.formState.errors.visibility ? (
          <span className="text-sm text-red-600">
            {form.formState.errors.visibility.message}
          </span>
        ) : null}
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-ink/75">설명</span>
        <textarea
          {...form.register("note")}
          rows={4}
          placeholder="이 여행을 어떤 흐름으로 묶는지 짧게 적어둡니다."
          className={cn(inputClassName, "min-h-28 resize-y py-3")}
        />
        {form.formState.errors.note ? (
          <span className="text-sm text-red-600">
            {form.formState.errors.note.message}
          </span>
        ) : null}
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
