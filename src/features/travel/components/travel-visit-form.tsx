"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { travelVisitFormSchema, type TravelVisitFormValues } from "@/features/travel/lib/travel-visit-schema";
import { cn } from "@/lib/utils";

type TravelVisitFormProps = {
  onSubmit: (values: TravelVisitFormValues) => void;
  className?: string;
  showHeader?: boolean;
};

const defaultValues: TravelVisitFormValues = {
  city: "",
  country: "",
  latitude: 37.5665,
  longitude: 126.978,
  startedAt: "",
  endedAt: "",
  note: ""
};

export function TravelVisitForm({
  onSubmit,
  className,
  showHeader = true
}: TravelVisitFormProps) {
  const form = useForm<TravelVisitFormValues>({
    resolver: zodResolver(travelVisitFormSchema),
    defaultValues
  });

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values);
    form.reset(defaultValues);
  });

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "grid gap-5 rounded-[28px] border border-line/10 bg-surface p-6 shadow-card",
        className
      )}
    >
      {showHeader ? (
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
            Add Visit
          </p>
          <h2 className="mt-2 text-2xl font-bold">방문지 추가</h2>
          <p className="mt-3 text-sm leading-6 text-ink/62">
            도시, 날짜, 좌표를 넣으면 지도와 연결선에 바로 반영됩니다.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="도시" error={form.formState.errors.city?.message}>
          <input
            {...form.register("city")}
            placeholder="예: 런던"
            className={inputClassName}
          />
        </Field>
        <Field label="국가" error={form.formState.errors.country?.message}>
          <input
            {...form.register("country")}
            placeholder="예: 영국"
            className={inputClassName}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="시작일" error={form.formState.errors.startedAt?.message}>
          <input type="date" {...form.register("startedAt")} className={inputClassName} />
        </Field>
        <Field label="종료일" error={form.formState.errors.endedAt?.message}>
          <input type="date" {...form.register("endedAt")} className={inputClassName} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="위도" error={form.formState.errors.latitude?.message}>
          <input
            type="number"
            step="0.0001"
            {...form.register("latitude")}
            className={inputClassName}
          />
        </Field>
        <Field label="경도" error={form.formState.errors.longitude?.message}>
          <input
            type="number"
            step="0.0001"
            {...form.register("longitude")}
            className={inputClassName}
          />
        </Field>
      </div>

      <Field label="메모" error={form.formState.errors.note?.message}>
        <textarea
          {...form.register("note")}
          rows={4}
          placeholder="이 장소에서 남기고 싶은 한 줄 메모"
          className={cn(inputClassName, "min-h-28 resize-y py-3")}
        />
      </Field>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          방문지 추가
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
