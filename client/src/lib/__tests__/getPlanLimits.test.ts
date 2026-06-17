import { describe, it, expect } from "vitest";
import { getPlanLimits, PLAN_LIMITS } from "../constants";

describe("getPlanLimits", () => {
  it("returns beta limits for null/undefined plan", () => {
    expect(getPlanLimits(null)).toEqual({ photoLimit: 1, videoLimit: 0 });
    expect(getPlanLimits(undefined)).toEqual({ photoLimit: 1, videoLimit: 0 });
  });

  it("returns standard limits for 'standard' plan", () => {
    expect(getPlanLimits("standard")).toEqual({ photoLimit: 3, videoLimit: 1 });
  });

  it("returns pro limits for 'pro' plan", () => {
    expect(getPlanLimits("pro")).toEqual({ photoLimit: 3, videoLimit: 3 });
  });

  it("falls back to beta for unknown plan", () => {
    expect(getPlanLimits("enterprise")).toEqual({ photoLimit: 1, videoLimit: 0 });
  });

  it("PLAN_LIMITS is consistent with getPlanLimits", () => {
    expect(getPlanLimits("beta")).toEqual({ photoLimit: PLAN_LIMITS.beta.photos, videoLimit: PLAN_LIMITS.beta.videos });
    expect(getPlanLimits("pro")).toEqual({ photoLimit: PLAN_LIMITS.pro.photos, videoLimit: PLAN_LIMITS.pro.videos });
  });
});