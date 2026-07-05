import { describe, it, expect } from "vitest";
import { generateToken, verifyToken, signHmac, safeEqual } from "./magic-token";

const SECRET = "test-secret-0123456789abcdef";
const EVENT_ID = "11111111-2222-3333-4444-555555555555";
const EMAIL = "organizador@example.com";

describe("safeEqual", () => {
  it("devuelve true para cadenas idénticas", () => {
    expect(safeEqual("abc123", "abc123")).toBe(true);
  });
  it("devuelve false para cadenas distintas de igual longitud", () => {
    expect(safeEqual("abc123", "abc124")).toBe(false);
  });
  it("devuelve false para longitudes distintas", () => {
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});

describe("signHmac", () => {
  it("es determinista: mismo payload + secret => misma firma", async () => {
    const a = await signHmac("hola:mundo:123", SECRET);
    const b = await signHmac("hola:mundo:123", SECRET);
    expect(a).toBe(b);
  });
  it("cambia si cambia el secret", async () => {
    const a = await signHmac("payload", SECRET);
    const b = await signHmac("payload", "otro-secret");
    expect(a).not.toBe(b);
  });
  it("produce hex de 64 caracteres (SHA-256)", async () => {
    const sig = await signHmac("x", SECRET);
    expect(sig).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("generateToken + verifyToken (round-trip)", () => {
  it("un token recién generado es válido y recupera eventId y email", async () => {
    const now = Date.now();
    const { token } = await generateToken(EVENT_ID, EMAIL, SECRET, now);
    const result = await verifyToken(token, SECRET, now);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.eventId).toBe(EVENT_ID);
      expect(result.email).toBe(EMAIL);
    }
  });

  it("expiresAt está 30 minutos por delante del instante de emisión", async () => {
    const now = 1_700_000_000_000;
    const { expiresAt } = await generateToken(EVENT_ID, EMAIL, SECRET, now);
    expect(new Date(expiresAt).getTime()).toBe(now + 30 * 60 * 1000);
  });

  it("respeta emails con '+' o ':' reconstruyéndolos bien", async () => {
    const tricky = "user+tag@example.com";
    const now = Date.now();
    const { token } = await generateToken(EVENT_ID, tricky, SECRET, now);
    const result = await verifyToken(token, SECRET, now);
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.email).toBe(tricky);
  });
});

describe("verifyToken — rechazos de seguridad", () => {
  it("rechaza un token expirado (más de 35 min)", async () => {
    const issued = 1_700_000_000_000;
    const { token } = await generateToken(EVENT_ID, EMAIL, SECRET, issued);
    const later = issued + 36 * 60 * 1000; // 36 min después
    const result = await verifyToken(token, SECRET, later);
    expect(result).toEqual({ valid: false, reason: "expired" });
  });

  it("acepta dentro del margen de gracia (34 min)", async () => {
    const issued = 1_700_000_000_000;
    const { token } = await generateToken(EVENT_ID, EMAIL, SECRET, issued);
    const later = issued + 34 * 60 * 1000;
    const result = await verifyToken(token, SECRET, later);
    expect(result.valid).toBe(true);
  });

  it("rechaza firma manipulada", async () => {
    const now = Date.now();
    const { token } = await generateToken(EVENT_ID, EMAIL, SECRET, now);
    const tampered = token.slice(0, -4) + "0000";
    const result = await verifyToken(tampered, SECRET, now);
    expect(result).toEqual({ valid: false, reason: "bad_signature" });
  });

  it("rechaza si el secret de verificación no coincide", async () => {
    const now = Date.now();
    const { token } = await generateToken(EVENT_ID, EMAIL, SECRET, now);
    const result = await verifyToken(token, "secret-equivocado", now);
    expect(result).toEqual({ valid: false, reason: "bad_signature" });
  });

  it("rechaza payload manipulado (cambiar el eventId invalida la firma)", async () => {
    const now = Date.now();
    const { token } = await generateToken(EVENT_ID, EMAIL, SECRET, now);
    const sig = token.split(".")[1];
    const forgedPayload = `${"99999999-0000-0000-0000-000000000000"}:${EMAIL}:${now}`;
    const forgedB64 = btoa(forgedPayload).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    const forgedToken = `${forgedB64}.${sig}`;
    const result = await verifyToken(forgedToken, SECRET, now);
    expect(result).toEqual({ valid: false, reason: "bad_signature" });
  });

  it("rechaza tokens malformados", async () => {
    for (const bad of ["", "sinpunto", ".", "a.b.c.d", "!!!.###"]) {
      const result = await verifyToken(bad, SECRET);
      expect(result.valid).toBe(false);
    }
  });
});
