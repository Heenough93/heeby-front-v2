import { describe, expect, it } from "vitest";
import {
  canAccessPath,
  canManageAsset,
  canManageStock,
  getFeatureKeyFromPath
} from "@/features/access/lib/access-policy";

describe("access policy", () => {
  it("maps known public routes to their feature", () => {
    expect(getFeatureKeyFromPath("/")).toBe("home");
    expect(getFeatureKeyFromPath("/journals")).toBe("journalArchive");
    expect(getFeatureKeyFromPath("/travel/trip-1")).toBe("travelArchive");
  });

  it("maps unknown routes to a denied feature", () => {
    expect(getFeatureKeyFromPath("/unmapped-feature")).toBe("unknown");
    expect(canAccessPath("guest", "/unmapped-feature")).toBe(false);
    expect(canAccessPath("member", "/unmapped-feature")).toBe(false);
    expect(canAccessPath("admin", "/unmapped-feature")).toBe(false);
  });

  it("keeps template pages admin-only", () => {
    expect(canAccessPath("guest", "/templates")).toBe(false);
    expect(canAccessPath("member", "/templates")).toBe(false);
    expect(canAccessPath("admin", "/templates")).toBe(true);
  });

  it("keeps financial archives readable for members but editors admin-only", () => {
    expect(canAccessPath("member", "/stocks")).toBe(true);
    expect(canAccessPath("member", "/stocks/trades")).toBe(true);
    expect(canAccessPath("member", "/stocks/snapshots/new")).toBe(false);
    expect(canAccessPath("member", "/stocks/ipos/new")).toBe(false);
    expect(canAccessPath("admin", "/stocks/snapshots/new")).toBe(true);

    expect(canAccessPath("member", "/assets")).toBe(true);
    expect(canAccessPath("member", "/assets/money-flow")).toBe(true);
    expect(canAccessPath("member", "/assets/snapshots/new")).toBe(false);
    expect(canAccessPath("admin", "/assets/snapshots/new")).toBe(true);
  });

  it("limits financial write actions to admin", () => {
    expect(canManageStock("guest")).toBe(false);
    expect(canManageStock("member")).toBe(false);
    expect(canManageStock("admin")).toBe(true);

    expect(canManageAsset("guest")).toBe(false);
    expect(canManageAsset("member")).toBe(false);
    expect(canManageAsset("admin")).toBe(true);
  });
});
