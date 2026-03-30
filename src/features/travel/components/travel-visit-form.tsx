"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  defaultTravelVisitFormValues,
  getTravelVisitFormValues
} from "@/features/travel/lib/travel-form-values";
import type { TravelVisitFormValues } from "@/features/travel/lib/travel-visit-schema";
import { travelVisitFormSchema } from "@/features/travel/lib/travel-visit-schema";
import type { TravelSearchCandidate } from "@/features/travel/lib/travel-search";
import type { TravelVisit } from "@/features/travel/lib/travel-types";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/stores/ui/use-toast-store";

type TravelVisitFormProps = {
  onSubmit: (values: TravelVisitFormValues) => void;
  visit?: TravelVisit;
  className?: string;
  submitLabel?: string;
};

export function TravelVisitForm({
  onSubmit,
  visit,
  className,
  submitLabel = "방문지 추가"
}: TravelVisitFormProps) {
  const showToast = useToastStore((state) => state.showToast);
  const form = useForm<TravelVisitFormValues>({
    resolver: zodResolver(travelVisitFormSchema),
    defaultValues: visit
      ? getTravelVisitFormValues(visit)
      : defaultTravelVisitFormValues
  });
  const [searchQuery, setSearchQuery] = useState(
    visit ? `${visit.city}, ${visit.country}` : ""
  );
  const [searchResults, setSearchResults] = useState<TravelSearchCandidate[]>([]);
  const [searchError, setSearchError] = useState("");
  const [isSearchPending, setIsSearchPending] = useState(false);

  useEffect(() => {
    form.reset(
      visit ? getTravelVisitFormValues(visit) : defaultTravelVisitFormValues
    );
    setSearchQuery(visit ? `${visit.city}, ${visit.country}` : "");
    setSearchResults([]);
    setSearchError("");
  }, [form, visit]);

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values);
    form.reset(visit ? getTravelVisitFormValues(visit) : defaultTravelVisitFormValues);
  });

  const handleSearch = async () => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length < 2) {
      setSearchError("검색어는 2자 이상 입력해주세요.");
      setSearchResults([]);
      return;
    }

    setIsSearchPending(true);
    setSearchError("");

    try {
      const response = await fetch(
        `/api/travel/search?q=${encodeURIComponent(trimmedQuery)}`
      );
      const payload = (await response.json()) as {
        code?: string;
        message?: string;
        candidates?: TravelSearchCandidate[];
      };

      if (!response.ok) {
        setSearchError(payload.message ?? "장소 검색에 실패했습니다.");
        setSearchResults([]);
        return;
      }

      setSearchResults(payload.candidates ?? []);

      if ((payload.candidates ?? []).length === 0) {
        setSearchError("검색 결과가 없습니다. 다른 도시명이나 국가명을 시도해주세요.");
      }
    } catch {
      setSearchError("장소 검색 요청 중 오류가 발생했습니다.");
      setSearchResults([]);
    } finally {
      setIsSearchPending(false);
    }
  };

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
          {visit ? "Edit Visit" : "Add Visit"}
        </p>
        <h2 className="mt-2 text-2xl font-bold">
          {visit ? "방문지 수정" : "방문지 추가"}
        </h2>
      </div>

      <section className="grid gap-4 rounded-[24px] border border-line/10 bg-paper p-5">
        <div>
          <p className="text-sm font-semibold">장소 검색</p>
        </div>

        <div className="relative">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") {
                  return;
                }

                event.preventDefault();
                void handleSearch();
              }}
              placeholder="예: Cairo, Egypt"
              className={cn(inputClassName, "flex-1")}
            />
            <button
              type="button"
              disabled={isSearchPending}
              onClick={() => {
                void handleSearch();
              }}
              className="rounded-full border border-line/10 bg-surface px-5 py-3 text-sm font-semibold text-ink/70 transition hover:border-coral/40 hover:bg-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSearchPending ? "검색 중..." : "검색"}
            </button>
          </div>

          {searchResults.length > 0 ? (
            <div className="absolute inset-x-0 top-[calc(100%+12px)] z-30 overflow-hidden rounded-[22px] border border-line/10 bg-surface shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
              <div className="max-h-72 overflow-y-auto p-3">
                <div className="grid gap-3">
                  {searchResults.map((candidate) => (
                    <button
                      key={candidate.placeId}
                      type="button"
                      onClick={() => {
                        form.setValue("city", candidate.city, {
                          shouldDirty: true,
                          shouldValidate: true
                        });
                        form.setValue("country", candidate.country, {
                          shouldDirty: true,
                          shouldValidate: true
                        });
                        form.setValue("latitude", candidate.latitude, {
                          shouldDirty: true,
                          shouldValidate: true
                        });
                        form.setValue("longitude", candidate.longitude, {
                          shouldDirty: true,
                          shouldValidate: true
                        });
                        setSearchQuery(`${candidate.city}, ${candidate.country}`);
                        setSearchResults([]);
                        setSearchError("");
                        showToast({
                          title: `${candidate.city} 좌표를 입력했습니다.`,
                          variant: "success"
                        });
                      }}
                      className="rounded-[20px] border border-line/10 bg-paper px-4 py-4 text-left transition hover:border-coral/35 hover:bg-soft"
                    >
                      <p className="text-sm font-semibold">
                        {candidate.city}, {candidate.country}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-ink/62">
                        {candidate.displayName}
                      </p>
                      <p className="mt-2 text-xs text-ink/52">
                        위도 {candidate.latitude.toFixed(4)} / 경도 {candidate.longitude.toFixed(4)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {searchError ? (
          <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {searchError}
          </div>
        ) : null}
      </section>

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
            inputMode="decimal"
            step="any"
            lang="en"
            {...form.register("latitude")}
            className={inputClassName}
          />
        </Field>
        <Field label="경도" error={form.formState.errors.longitude?.message}>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            lang="en"
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
