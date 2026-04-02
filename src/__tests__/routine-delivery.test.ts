import { afterEach, describe, expect, it } from "vitest";
import { buildRoutineTelegramMessage, isRoutineDueAt } from "@/features/routines/lib/routine-delivery";
import { routines } from "@/mocks/routines";

describe("routine delivery helpers", () => {
  afterEach(() => {
    delete process.env.ROUTINE_TIME_ZONE;
  });

  it("matches a weekly routine when the zoned time is due", () => {
    process.env.ROUTINE_TIME_ZONE = "Asia/Seoul";

    const isDue = isRoutineDueAt(routines[0], new Date("2026-04-05T04:00:00.000Z"));

    expect(isDue).toBe(true);
  });

  it("does not match an inactive routine", () => {
    process.env.ROUTINE_TIME_ZONE = "Asia/Seoul";

    const isDue = isRoutineDueAt(routines[2], new Date("2026-04-01T12:00:00.000Z"));

    expect(isDue).toBe(false);
  });

  it("builds a telegram message with title and body", () => {
    expect(buildRoutineTelegramMessage(routines[0])).toBe(
      "[주간 시총 점검]\n이번 주 시총 순위 스냅샷을 작성하세요."
    );
  });
});
