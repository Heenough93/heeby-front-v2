import { featureRoutePatterns } from "@/features/access/config/feature-routes";
import type { AccessMode } from "@/features/access/store/access-store";
import type { ContentVisibility } from "@/types/domain";

type FeaturePolicy = {
  guest: boolean;
  member: boolean;
  admin: boolean;
};

export const featurePolicies = {
  unknown: {
    guest: false,
    member: false,
    admin: false
  },
  home: {
    guest: true,
    member: true,
    admin: true
  },
  login: {
    guest: true,
    member: true,
    admin: true
  },
  contact: {
    guest: true,
    member: true,
    admin: true
  },
  assetArchive: {
    guest: false,
    member: true,
    admin: true
  },
  assetEditor: {
    guest: false,
    member: false,
    admin: true
  },
  travelArchive: {
    guest: true,
    member: true,
    admin: true
  },
  travelEditor: {
    guest: false,
    member: true,
    admin: true
  },
  routineArchive: {
    guest: false,
    member: true,
    admin: true
  },
  routineEditor: {
    guest: false,
    member: true,
    admin: true
  },
  stockArchive: {
    guest: false,
    member: true,
    admin: true
  },
  stockEditor: {
    guest: false,
    member: false,
    admin: true
  },
  journalArchive: {
    guest: true,
    member: true,
    admin: true
  },
  journalEditor: {
    guest: false,
    member: true,
    admin: true
  },
  journalTemplateAdmin: {
    guest: false,
    member: false,
    admin: true
  }
} satisfies Record<string, FeaturePolicy>;

export type FeatureKey = keyof typeof featurePolicies;

type RouteMatcher = string | RegExp;

export function canAccessFeature(accessMode: AccessMode, featureKey: FeatureKey) {
  return featurePolicies[featureKey][accessMode];
}

export function canAccessPath(accessMode: AccessMode, pathname: string) {
  return canAccessFeature(accessMode, getFeatureKeyFromPath(pathname));
}

export function getFeatureKeyFromPath(pathname: string): FeatureKey {
  const featureEntries = Object.entries(featureRoutePatterns) as Array<
    [FeatureKey, readonly RouteMatcher[]]
  >;
  const featureEntry = featureEntries.find(([, matchers]) =>
    matchers.some((matcher) =>
      typeof matcher === "string" ? pathname === matcher : matcher.test(pathname)
    )
  );

  return featureEntry?.[0] ?? "unknown";
}

export function canReadContent(
  accessMode: AccessMode,
  visibility: ContentVisibility
) {
  if (accessMode === "guest") {
    return visibility === "public";
  }

  return true;
}

export function canReadTravelTrip(
  accessMode: AccessMode,
  visibility: ContentVisibility
) {
  return canReadContent(accessMode, visibility);
}

export function canEditJournal(accessMode: AccessMode) {
  return accessMode === "member" || accessMode === "admin";
}

export function canManageTravel(accessMode: AccessMode) {
  return accessMode === "member" || accessMode === "admin";
}

export function canManageRoutine(accessMode: AccessMode) {
  return accessMode === "member" || accessMode === "admin";
}

export function canManageStock(accessMode: AccessMode) {
  return accessMode === "admin";
}

export function canManageAsset(accessMode: AccessMode) {
  return accessMode === "admin";
}

export function canManageJournalTemplate(accessMode: AccessMode) {
  return accessMode === "admin";
}

export function getVisibilityLabel(visibility: ContentVisibility) {
  return visibility === "public" ? "공개" : "비공개";
}
