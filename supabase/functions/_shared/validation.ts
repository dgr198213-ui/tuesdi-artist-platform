/**
 * Utilidades de validación para Edge Functions
 * Previene inyección SQL, XSS y otros ataques
 */

/**
 * Valida que un email tenga formato correcto
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Valida que un UUID sea válido (v4)
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Valida que una URL sea segura (https o http local)
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || (parsed.protocol === "http:" && parsed.hostname === "localhost");
  } catch {
    return false;
  }
}

/**
 * Limpia una cadena de caracteres peligrosos (previene XSS básico)
 * Nota: Esto es una protección adicional; la verdadera defensa es usar parámetros preparados
 */
export function sanitizeString(input: string, maxLength = 1000): string {
  if (typeof input !== "string") return "";
  
  // Limitar longitud
  let sanitized = input.substring(0, maxLength);
  
  // Remover caracteres de control
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "");
  
  // Remover etiquetas HTML (protección adicional)
  sanitized = sanitized.replace(/<[^>]*>/g, "");
  
  return sanitized.trim();
}

/**
 * Valida un objeto contra un esquema simple
 */
export interface ValidationSchema {
  [key: string]: {
    type: "string" | "number" | "boolean" | "email" | "uuid" | "url";
    required?: boolean;
    maxLength?: number;
  };
}

export function validateObject(
  obj: Record<string, unknown>,
  schema: ValidationSchema
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const [key, rules] of Object.entries(schema)) {
    const value = obj[key];

    // Verificar requerido
    if (rules.required && (value === undefined || value === null || value === "")) {
      errors[key] = `${key} es requerido`;
      continue;
    }

    if (value === undefined || value === null) {
      continue;
    }

    // Verificar tipo
    if (rules.type === "string" && typeof value !== "string") {
      errors[key] = `${key} debe ser una cadena`;
      continue;
    }

    if (rules.type === "number" && typeof value !== "number") {
      errors[key] = `${key} debe ser un número`;
      continue;
    }

    if (rules.type === "boolean" && typeof value !== "boolean") {
      errors[key] = `${key} debe ser un booleano`;
      continue;
    }

    // Validaciones específicas
    if (rules.type === "email" && !isValidEmail(value as string)) {
      errors[key] = `${key} no es un email válido`;
      continue;
    }

    if (rules.type === "uuid" && !isValidUUID(value as string)) {
      errors[key] = `${key} no es un UUID válido`;
      continue;
    }

    if (rules.type === "url" && !isValidUrl(value as string)) {
      errors[key] = `${key} no es una URL válida`;
      continue;
    }

    // Verificar longitud máxima
    if (rules.maxLength && typeof value === "string" && value.length > rules.maxLength) {
      errors[key] = `${key} no puede exceder ${rules.maxLength} caracteres`;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
