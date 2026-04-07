"use client";

import { z } from "zod";
import type { AccessStore } from "@/features/access/store/access-store";
import { useAccessStore } from "@/features/access/store/access-store";
import type { JournalTemplate } from "@/features/journal-templates/lib/journal-template-types";
import { useJournalTemplateStore } from "@/features/journal-templates/store/journal-template-store";
import type { Journal } from "@/features/journals/lib/journal-types";
import { useJournalStore } from "@/features/journals/store/journal-store";
import type { Routine } from "@/features/routines/lib/routine-types";
import { useRoutineStore } from "@/features/routines/store/routine-store";
import type {
  StockIpoEntry,
  Stock,
  StockSnapshot,
  StockSnapshotItem,
  StockTradeEntry
} from "@/features/stocks/lib/stock-types";
import { useStockStore } from "@/features/stocks/store/stock-store";
import type { TravelTrip, TravelVisit } from "@/features/travel/lib/travel-types";
import { useTravelStore } from "@/features/travel/store/travel-store";
import type { Announcement } from "@/stores/ui/use-announcement-store";
import { useAnnouncementStore } from "@/stores/ui/use-announcement-store";
import { useFeatureFlagStore } from "@/stores/app/use-feature-flag-store";
import { routineChannelTypes, routineRepeatTypes } from "@/features/routines/lib/routine-types";
import {
  stockMarketValues,
  stockSnapshotScopeValues,
  stockTradeAccountTypeValues,
  stockTradePositionStatusValues
} from "@/features/stocks/lib/stock-types";
import { contentVisibilityValues, ownerScopeValues, themeValues } from "@/types/domain";

export const ADMIN_BACKUP_VERSION = 1;

type BackupFeatureFlags = {
  showTravelWidget: boolean;
  showStockWidget: boolean;
};

type BackupAccessState = Pick<AccessStore, "isAuthenticated" | "isAdminUnlocked">;

export type AdminBackupData = {
  version: typeof ADMIN_BACKUP_VERSION;
  exportedAt: string;
  journals: Journal[];
  journalTemplates: JournalTemplate[];
  recentJournalTemplateIds: string[];
  routines: Routine[];
  travelTrips: TravelTrip[];
  travelVisits: TravelVisit[];
  stockMasters: Stock[];
  stockSnapshots: StockSnapshot[];
  stockSnapshotItems: StockSnapshotItem[];
  stockTradeEntries: StockTradeEntry[];
  stockIpoEntries: StockIpoEntry[];
  announcements: Announcement[];
  featureFlags: BackupFeatureFlags;
  access: BackupAccessState;
};

type ParseBackupResult =
  | { ok: true; backup: AdminBackupData }
  | { ok: false; error: string };

const isoDateTimeSchema = z.string().min(1);
const localDateSchema = z.string().min(1);
const baseEntitySchema = z.object({
  id: z.string().min(1),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema
});

const journalSchema = baseEntitySchema.extend({
  title: z.string().min(1),
  theme: z.enum(themeValues),
  journalTemplateId: z.string().min(1),
  visibility: z.enum(contentVisibilityValues),
  answers: z.array(
    z.object({
      question: z.string().min(1),
      answer: z.string().min(1)
    })
  )
});

const journalTemplateSchema = baseEntitySchema.extend({
  name: z.string().min(1),
  theme: z.enum(themeValues),
  visibility: z.enum(contentVisibilityValues),
  questions: z.array(z.string().min(1))
});

const routineBaseSchema = baseEntitySchema.extend({
  title: z.string().min(1),
  message: z.string().min(1),
  repeatType: z.enum(routineRepeatTypes),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  isActive: z.boolean(),
  channel: z.enum(routineChannelTypes)
});

const routineSchema = z.discriminatedUnion("repeatType", [
  routineBaseSchema.extend({
    repeatType: z.literal("daily")
  }),
  routineBaseSchema.extend({
    repeatType: z.literal("weekly"),
    dayOfWeek: z.number().int().min(0).max(6)
  }),
  routineBaseSchema.extend({
    repeatType: z.literal("monthly"),
    dayOfMonth: z.number().int().min(1).max(31)
  }),
  routineBaseSchema.extend({
    repeatType: z.literal("yearly"),
    month: z.number().int().min(1).max(12),
    dayOfMonth: z.number().int().min(1).max(31)
  }),
  routineBaseSchema.extend({
    repeatType: z.literal("once"),
    scheduledDate: localDateSchema
  })
]);

const travelTripSchema = baseEntitySchema.extend({
  name: z.string().min(1),
  visibility: z.enum(contentVisibilityValues),
  note: z.string().optional()
});

const travelVisitSchema = baseEntitySchema.extend({
  tripId: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  startedAt: localDateSchema,
  endedAt: localDateSchema.optional(),
  note: z.string().optional()
});

const stockSchema = baseEntitySchema.extend({
  name: z.string().min(1),
  ticker: z.string().min(1),
  market: z.enum(stockMarketValues),
  sector: z.string().optional()
});

const stockSnapshotSchema = baseEntitySchema.extend({
  title: z.string().min(1),
  weekKey: z.string().regex(/^\d{4}-W\d{2}$/),
  marketScope: z.enum(stockSnapshotScopeValues),
  comment: z.string().optional(),
  sourceSnapshotId: z.string().optional()
});

const stockSnapshotItemSchema = baseEntitySchema.extend({
  snapshotId: z.string().min(1),
  stockId: z.string().min(1),
  rank: z.number().int().min(1),
  marketCap: z.string().optional(),
  price: z.string().optional(),
  note: z.string().optional()
});

const stockTradeEntrySchema = baseEntitySchema.extend({
  tradedAt: localDateSchema,
  accountName: z.string().min(1),
  accountType: z.enum(stockTradeAccountTypeValues),
  stockName: z.string().min(1),
  ticker: z.string().min(1),
  market: z.enum(stockMarketValues),
  positionStatus: z.enum(stockTradePositionStatusValues),
  quantity: z.number().positive(),
  buyPrice: z.number().positive(),
  currentPrice: z.number().positive().optional(),
  currentPriceUpdatedAt: isoDateTimeSchema.optional(),
  soldAt: localDateSchema.optional(),
  sellPrice: z.number().positive().optional(),
  fee: z.number().min(0).optional(),
  note: z.string().optional()
}).superRefine((value, ctx) => {
  if (value.positionStatus === "closed") {
    if (!value.soldAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["soldAt"],
        message: "매도 완료 데이터에는 매도일이 필요합니다."
      });
    }

    if (value.sellPrice === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sellPrice"],
        message: "매도 완료 데이터에는 매도가가 필요합니다."
      });
    }
  }
});

const stockIpoEntrySchema = baseEntitySchema.extend({
  ownerScope: z.enum(ownerScopeValues),
  stockName: z.string().min(1),
  brokerage: z.string().min(1),
  subscribedAt: localDateSchema,
  deposit: z.number().min(0),
  allocatedQuantity: z.number().min(0),
  refundedAt: localDateSchema.optional(),
  refundAmount: z.number().min(0).optional(),
  subscriptionFee: z.number().min(0).optional(),
  listedAt: localDateSchema.optional(),
  sellAmount: z.number().min(0).optional(),
  settledAt: localDateSchema.optional(),
  taxAndFee: z.number().min(0).optional()
});

const announcementSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  primaryActionLabel: z.string().optional(),
  primaryActionHref: z.string().optional(),
  dismissMode: z.enum(["close-only", "hide-for-today"]),
  isActive: z.boolean(),
  priority: z.number().int()
});

const backupSchema = z.object({
  version: z.literal(ADMIN_BACKUP_VERSION),
  exportedAt: isoDateTimeSchema,
  journals: z.array(journalSchema),
  journalTemplates: z.array(journalTemplateSchema),
  recentJournalTemplateIds: z.array(z.string().min(1)),
  routines: z.array(routineSchema),
  travelTrips: z.array(travelTripSchema),
  travelVisits: z.array(travelVisitSchema),
  stockMasters: z.array(stockSchema),
  stockSnapshots: z.array(stockSnapshotSchema),
  stockSnapshotItems: z.array(stockSnapshotItemSchema),
  stockTradeEntries: z.array(stockTradeEntrySchema),
  stockIpoEntries: z.array(stockIpoEntrySchema),
  announcements: z.array(announcementSchema),
  featureFlags: z.object({
    showTravelWidget: z.boolean(),
    showStockWidget: z.boolean()
  }),
  access: z.object({
    isAuthenticated: z.boolean(),
    isAdminUnlocked: z.boolean()
  })
});

export function createAdminBackup(): AdminBackupData {
  const journalState = useJournalStore.getState();
  const journalTemplateState = useJournalTemplateStore.getState();
  const routineState = useRoutineStore.getState();
  const travelState = useTravelStore.getState();
  const stockState = useStockStore.getState();
  const announcementState = useAnnouncementStore.getState();
  const featureFlagState = useFeatureFlagStore.getState();
  const accessState = useAccessStore.getState();

  return {
    version: ADMIN_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    journals: journalState.journals,
    journalTemplates: journalTemplateState.journalTemplates,
    recentJournalTemplateIds: journalTemplateState.recentJournalTemplateIds,
    routines: routineState.routines,
    travelTrips: travelState.trips,
    travelVisits: travelState.visits,
    stockMasters: stockState.stocks,
    stockSnapshots: stockState.snapshots,
    stockSnapshotItems: stockState.snapshotItems,
    stockTradeEntries: stockState.tradeEntries,
    stockIpoEntries: stockState.ipoEntries,
    announcements: announcementState.announcements,
    featureFlags: featureFlagState.flags,
    access: {
      isAuthenticated: accessState.isAuthenticated,
      isAdminUnlocked: accessState.isAdminUnlocked
    }
  };
}

export function parseAdminBackup(input: string): ParseBackupResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(input) as unknown;
  } catch {
    return {
      ok: false,
      error: "JSON 파일을 읽지 못했습니다."
    };
  }

  const validation = backupSchema.safeParse(parsed);

  if (!validation.success) {
    const issue = validation.error.issues[0];
    const issuePath =
      issue?.path.length
        ? `(${issue.path.join(".")}) `
        : "";

    return {
      ok: false,
      error: `백업 파일 검증에 실패했습니다. ${issuePath}${issue?.message ?? "형식이 올바르지 않습니다."}`
    };
  }

  return {
    ok: true,
    backup: validation.data
  };
}

export function applyAdminBackup(backup: AdminBackupData) {
  useJournalStore.setState({
    journals: backup.journals
  });
  useJournalTemplateStore.setState({
    journalTemplates: backup.journalTemplates,
    recentJournalTemplateIds: backup.recentJournalTemplateIds
  });
  useRoutineStore.setState({
    routines: backup.routines
  });
  useTravelStore.setState({
    trips: backup.travelTrips,
    visits: backup.travelVisits
  });
  useStockStore.setState({
    stocks: backup.stockMasters,
    snapshots: backup.stockSnapshots,
    snapshotItems: backup.stockSnapshotItems,
    tradeEntries: backup.stockTradeEntries,
    ipoEntries: backup.stockIpoEntries
  });
  useAnnouncementStore.setState({
    announcements: backup.announcements
  });
  useFeatureFlagStore.setState({
    flags: backup.featureFlags
  });
  useAccessStore.setState({
    isAuthenticated: backup.access.isAuthenticated,
    isAdminUnlocked: backup.access.isAdminUnlocked
  });
}
