import { describe, expect, it } from "vitest";
import {
  ADMIN_BACKUP_VERSION,
  applyAdminBackup,
  createAdminBackup,
  parseAdminBackup
} from "@/features/admin/lib/admin-backup";
import { useAccessStore } from "@/features/access/store/access-store";
import { useJournalTemplateStore } from "@/features/journal-templates/store/journal-template-store";
import { useJournalStore } from "@/features/journals/store/journal-store";
import { useRoutineStore } from "@/features/routines/store/routine-store";
import { useStockStore } from "@/features/stocks/store/stock-store";
import { useTravelStore } from "@/features/travel/store/travel-store";
import { useFeatureFlagStore } from "@/stores/app/use-feature-flag-store";
import { useAnnouncementStore } from "@/stores/ui/use-announcement-store";

describe("admin backup", () => {
  it("creates a backup snapshot from current stores", () => {
    const backup = createAdminBackup();

    expect(backup.version).toBe(ADMIN_BACKUP_VERSION);
    expect(backup.journals).toEqual(useJournalStore.getState().journals);
    expect(backup.travelTrips).toEqual(useTravelStore.getState().trips);
    expect(backup.stockTradeEntries).toEqual(useStockStore.getState().tradeEntries);
    expect(backup.announcements).toEqual(
      useAnnouncementStore.getState().announcements
    );
  });

  it("parses a valid backup and rejects invalid input", () => {
    const serialized = JSON.stringify(createAdminBackup());
    const parsed = parseAdminBackup(serialized);

    expect(parsed.ok).toBe(true);

    expect(parseAdminBackup("{")).toEqual({
      ok: false,
      error: "JSON 파일을 읽지 못했습니다."
    });

    expect(
      parseAdminBackup(
        JSON.stringify({
          version: 999,
          exportedAt: new Date().toISOString()
        })
      )
    ).toEqual({
      ok: false,
      error: `백업 파일 검증에 실패했습니다. (version) Invalid literal value, expected ${ADMIN_BACKUP_VERSION}`
    });

    const invalidBackup = {
      ...createAdminBackup(),
      journals: [
        {
          ...useJournalStore.getState().journals[0],
          visibility: "secret"
        }
      ]
    };

    expect(parseAdminBackup(JSON.stringify(invalidBackup))).toEqual({
      ok: false,
      error:
        "백업 파일 검증에 실패했습니다. (journals.0.visibility) Invalid enum value. Expected 'public' | 'private', received 'secret'"
    });
  });

  it("applies backup data to all persisted stores", () => {
    const originalBackup = createAdminBackup();
    const nextBackup = {
      ...originalBackup,
      exportedAt: "2026-04-05T00:00:00.000Z",
      journals: originalBackup.journals.slice(0, 1),
      journalTemplates: originalBackup.journalTemplates.slice(0, 1),
      recentJournalTemplateIds: originalBackup.recentJournalTemplateIds.slice(0, 1),
      routines: originalBackup.routines.slice(0, 1),
      travelTrips: originalBackup.travelTrips.slice(0, 1),
      travelVisits: originalBackup.travelVisits.slice(0, 1),
      stockMasters: originalBackup.stockMasters.slice(0, 1),
      stockSnapshots: originalBackup.stockSnapshots.slice(0, 1),
      stockSnapshotItems: originalBackup.stockSnapshotItems.slice(0, 1),
      stockTradeEntries: originalBackup.stockTradeEntries.slice(0, 1),
      announcements: originalBackup.announcements.slice(0, 1),
      featureFlags: {
        showTravelWidget: false,
        showStockWidget: false
      },
      access: {
        isAuthenticated: true,
        isAdminUnlocked: true
      }
    };

    applyAdminBackup(nextBackup);

    expect(useJournalStore.getState().journals).toEqual(nextBackup.journals);
    expect(useJournalTemplateStore.getState().journalTemplates).toEqual(
      nextBackup.journalTemplates
    );
    expect(useRoutineStore.getState().routines).toEqual(nextBackup.routines);
    expect(useTravelStore.getState().trips).toEqual(nextBackup.travelTrips);
    expect(useTravelStore.getState().visits).toEqual(nextBackup.travelVisits);
    expect(useStockStore.getState().stocks).toEqual(nextBackup.stockMasters);
    expect(useStockStore.getState().snapshots).toEqual(nextBackup.stockSnapshots);
    expect(useStockStore.getState().snapshotItems).toEqual(
      nextBackup.stockSnapshotItems
    );
    expect(useStockStore.getState().tradeEntries).toEqual(
      nextBackup.stockTradeEntries
    );
    expect(useAnnouncementStore.getState().announcements).toEqual(
      nextBackup.announcements
    );
    expect(useFeatureFlagStore.getState().flags).toEqual(nextBackup.featureFlags);
    expect(useAccessStore.getState().isAdminUnlocked).toBe(true);

    applyAdminBackup(originalBackup);
  });
});
