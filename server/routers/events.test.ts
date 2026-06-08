import { describe, expect, it } from "vitest";
import { eventsRouter } from "./events";
import type { TrpcContext } from "../_core/context";
import type { User } from "../../drizzle/schema";

function createMockContext(user?: User): TrpcContext {
  return {
    user: user || {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      isArtist: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("eventsRouter", () => {
  it("should allow public access to list", async () => {
    const contextWithoutUser = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    } as TrpcContext;

    const caller = eventsRouter.createCaller(contextWithoutUser);

    const result = await caller.list({ limit: 10, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should allow public access to getById", async () => {
    const contextWithoutUser = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    } as TrpcContext;

    const caller = eventsRouter.createCaller(contextWithoutUser);

    const result = await caller.getById({ id: 1 });
    expect(result === undefined || typeof result === "object").toBe(true);
  });

  it("should require authentication for listMy", async () => {
    const contextWithoutUser = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    } as TrpcContext;

    const caller = eventsRouter.createCaller(contextWithoutUser);

    try {
      await caller.listMy();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });

  it("should require authentication for create", async () => {
    const contextWithoutUser = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    } as TrpcContext;

    const caller = eventsRouter.createCaller(contextWithoutUser);

    try {
      await caller.create({
        title: "Test Event",
        eventDate: "2024-06-15",
        venue: "Test Venue",
        city: "Madrid",
        country: "Spain",
        contactEmail: "test@example.com",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });

  it("should support search filter in list", async () => {
    const contextWithoutUser = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    } as TrpcContext;

    const caller = eventsRouter.createCaller(contextWithoutUser);

    const result = await caller.list({
      limit: 10,
      offset: 0,
      search: "concert",
    });
    expect(Array.isArray(result)).toBe(true);
  });
});
