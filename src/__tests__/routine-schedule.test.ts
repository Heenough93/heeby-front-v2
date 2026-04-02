import { describe, expect, it } from "vitest";
import { getRoutineNextRunHint, getRoutineRepeatLabel } from "@/features/routines/lib/routine-schedule";
import { routines } from "@/mocks/routines";

describe("routine schedule helpers", () => {
  it("formats weekly repeat labels", () => {
    expect(getRoutineRepeatLabel(routines[0])).toBe("매주 일요일 13:00");
  });

  it("formats daily repeat labels", () => {
    expect(getRoutineRepeatLabel(routines[1])).toBe("매일 20:30");
  });

  it("returns inactive hint when routine is disabled", () => {
    expect(getRoutineNextRunHint(routines[2])).toBe("비활성");
  });
});
