"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useRoutineStore } from "@/features/routines/store/routine-store";
import { getRoutineNextRunHint, getRoutineRepeatLabel } from "@/features/routines/lib/routine-schedule";
import type { RoutineRepeatType } from "@/features/routines/lib/routine-types";
import { cn } from "@/lib/utils";

type RepeatFilter = "전체" | RoutineRepeatType;

export function RoutineList() {
  const routines = useRoutineStore((state) => state.routines);
  const [search, setSearch] = useState("");
  const [repeatFilter, setRepeatFilter] = useState<RepeatFilter>("전체");

  const filteredRoutines = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const nextRoutines =
      repeatFilter === "전체"
        ? routines
        : routines.filter((routine) => routine.repeatType === repeatFilter);

    return [...nextRoutines]
      .filter((routine) => {
        if (!normalizedSearch) {
          return true;
        }

        return `${routine.title} ${routine.message}`.toLowerCase().includes(normalizedSearch);
      })
      .sort((a, b) => dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf());
  }, [repeatFilter, routines, search]);

  return (
    <section className="grid gap-6">
      <div className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink/75">검색</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="루틴 제목 또는 메시지로 검색"
              className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-surface"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink/75">반복 방식</span>
            <select
              value={repeatFilter}
              onChange={(event) => setRepeatFilter(event.target.value as RepeatFilter)}
              className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-surface"
            >
              <option value="전체">전체</option>
              <option value="yearly">매년</option>
              <option value="monthly">매달</option>
              <option value="weekly">매주</option>
              <option value="daily">매일</option>
              <option value="once">한번</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredRoutines.map((routine) => (
          <Link
            key={routine.id}
            href={`/routines/${routine.id}`}
            className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card transition hover:-translate-y-0.5 hover:border-coral/30"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    routine.isActive
                      ? "bg-coral/10 text-coral"
                      : "bg-soft text-ink/68"
                  )}
                >
                  {routine.isActive ? "활성" : "비활성"}
                </span>
                <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/68">
                  {getRoutineRepeatLabel(routine)}
                </span>
              </div>
              <span className="text-xs text-ink/45">{getRoutineNextRunHint(routine)}</span>
            </div>

            <h2 className="mt-4 text-xl font-semibold">{routine.title}</h2>
            <p className="mt-3 text-sm leading-6 text-ink/65">{routine.message}</p>
          </Link>
        ))}
      </div>

      {filteredRoutines.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-line/15 bg-surface p-10 text-center shadow-card">
          <p className="text-lg font-semibold">
            {search ? "검색 결과가 없습니다." : "아직 루틴이 없습니다."}
          </p>
          <p className="mt-2 text-sm text-ink/60">
            {search
              ? "검색어를 바꾸거나 반복 방식 필터를 조정해보세요."
              : "첫 루틴을 만들고 텔레그램 리마인더 흐름을 시작해보세요."}
          </p>
        </div>
      ) : null}
    </section>
  );
}
