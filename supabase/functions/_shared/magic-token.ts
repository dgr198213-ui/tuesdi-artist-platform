/**
 * magic-token.ts — Lógica pura de firma/verificación de magic links.
 *
 * Extraída de create-magic-link y confirm-event para poder testearla de forma
 * aislada (sin red, sin Supabase). Usa Web Crypto (crypto.subtle), disponible
 * tanto en el runtime Deno de las Edge Functions como en Node 20+ y en jsdom,
 * así que el mismo código corre en producción y en los tests con vitest.
 *
 * Formato del token:  base64url(payload) + "." + hmacHexHex
 *   payload = `${eventId}:${email}:${timestamp}`
 */

const TOKEN_TTL_MS = 30 * 60 * 1000;       // el token se emite con 30 min de vida
const VERIFY_GRACE_MS = 35 * 60 * 1000;    // margen al verificar (5 min de reloj)

function toBase64Url(str: string): string {
  const b64 = btoa(str);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function fromBase64Url(b64url: string): string {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  return atob(padded);
}

/** Comparación en tiempo constante (evita timing attacks). */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Firma HMAC-SHA256 de un payload, devuelta como hex. */
export async function signHmac(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Genera un token firmado para (eventId, email) en el instante `now`. */
export async function generateToken(
  eventId: string,
  email: string,
  secret: string,
  now: number = Date.now(),
): Promise<{ token: string; expiresAt: string }> {
  const payload = `${eventId}:${email}:${now}`;
  const signature = await signHmac(payload, secret);
  const token = `${toBase64Url(payload)}.${signature}`;
  const expiresAt = new Date(now + TOKEN_TTL_MS).toISOString();
  return { token, expiresAt };
}

export type VerifyResult =
  | { valid: true; eventId: string; email: string; signature: string }
  | { valid: false; reason: "malformed" | "expired" | "bad_signature" };

/** Verifica firma y expiración de un token. No toca la base de datos. */
export async function verifyToken(
  token: string,
  secret: string,
  now: number = Date.now(),
): Promise<VerifyResult> {
  if (!token || !token.includes(".")) return { valid: false, reason: "malformed" };

  const dotIdx = token.lastIndexOf(".");
  const tokenPayload = token.slice(0, dotIdx);
  const signature = token.slice(dotIdx + 1);

  let payload: string;
  try {
    payload = fromBase64Url(tokenPayload);
  } catch {
    return { valid: false, reason: "malformed" };
  }

  const parts = payload.split(":");
  if (parts.length < 3) return { valid: false, reason: "malformed" };

  const eventId = parts[0];
  const email = parts.slice(1, parts.length - 1).join(":");
  const timestamp = parts[parts.length - 1];

  const age = now - parseInt(timestamp, 10);
  if (isNaN(age) || age > VERIFY_GRACE_MS) return { valid: false, reason: "expired" };

  const expected = await signHmac(payload, secret);
  if (!safeEqual(signature, expected)) return { valid: false, reason: "bad_signature" };

  return { valid: true, eventId, email, signature };
}
