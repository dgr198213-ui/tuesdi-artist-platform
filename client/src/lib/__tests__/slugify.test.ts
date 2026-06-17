import { describe, it, expect } from "vitest";
import { slugify } from "../constants";

describe("slugify", () => {
  it("lowercases ASCII text", () => {
    expect(slugify("Neon Dreamer")).toBe("neon-dreamer");
  });

  it("strips accents and diacritics (NFD)", () => {
    expect(slugify("José María")).toBe("jose-maria");
    expect(slugify("Añón")).toBe("anon");
  });

  it("replaces spaces and special chars with hyphens", () => {
    expect(slugify("DJ  &  Bass")).toBe("dj-bass");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  --hello--  ")).toBe("hello");
  });

  it("returns 'artista' for empty strings", () => {
    expect(slugify("")).toBe("artista");
    expect(slugify("   ")).toBe("artista");
  });

  it("handles numbers", () => {
    expect(slugify("Band 47")).toBe("band-47");
  });

  it("handles emojis/symbols by stripping them", () => {
    expect(slugify("Rock 🎸 Band")).toBe("rock-band");
  });
});