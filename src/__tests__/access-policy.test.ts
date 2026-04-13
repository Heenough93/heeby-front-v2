import { describe, expect, it } from "vitest";
import {
  canAccessPath,
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
});
