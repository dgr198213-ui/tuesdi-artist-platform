# TUESDI v3.0 — Guía de Seguridad

Este documento describe las medidas de seguridad implementadas en TUESDI y las mejores prácticas para mantener la plataforma segura.

## 1. Gestión de Secretos

### Variables de Entorno Sensibles

Las siguientes variables **NUNCA** deben exponerse en el frontend o commits:

- `STRIPE_SECRET_KEY` — Clave secreta de Stripe
- `STRIPE_WEBHOOK_SECRET` — Secreto del webhook de Stripe
- `SUPABASE_SERVICE_ROLE_KEY` — Clave de servicio de Supabase
- `MAGIC_LINK_SECRET` — Secret para generar Magic Links
- `RESEND_API_KEY` — API key de Resend
- `TUESDI_PROD_KEY` — Clave de producción

### Configuración Segura

1. **Frontend**: Solo variables con prefijo `VITE_` son accesibles en el cliente. Estas deben ser **públicas**.
2. **Backend**: Variables sin prefijo `VITE_` están disponibles solo en Edge Functions y servidor.
3. **`.env.local`**: Nunca versionear este archivo. Usar `.env.example` como referencia.

### Rotación de Secretos

Si un secreto se expone accidentalmente:

1. **Inmediatamente**: Revocar la clave en el servicio correspondiente (Stripe, Supabase, Resend).
2. **Generar nueva**: Crear una nueva clave y actualizar en el entorno.
3. **Auditar**: Revisar logs para detectar uso no autorizado.

## 2. Seguridad a Nivel de Base de Datos (RLS)

### Row Level Security (RLS)

Todas las tablas principales tienen RLS habilitado con políticas específicas:

| Tabla | Lectura | Escritura | Notas |
|-------|---------|-----------|-------|
| `artists` | Pública | Solo propietario | Perfiles públicos, edición privada |
| `events` | Solo `approved` | Anónima | Eventos pendientes no visibles públicamente |
| `contact_requests` | Solo propietario | Anónima | Formularios públicos, bandeja privada |
| `subscriptions` | Solo propietario | Edge Functions | Datos de suscripción privados |
| `media` | Pública | Solo propietario | Galerías públicas, gestión privada |

### Políticas Críticas

**Eventos (Fase 1.1)**:
```sql
-- Solo eventos aprobados son públicos
CREATE POLICY "Eventos aprobados son públicos" ON public.events
    FOR SELECT USING (status = 'approved');

-- Artistas ven sus propios eventos
CREATE POLICY "Artistas pueden ver sus eventos" ON public.events
    FOR SELECT USING (
        artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid())
    );
```

## 3. Validación de Entrada

### Edge Functions

Todas las Edge Functions implementan validación exhaustiva:

1. **Tipo de dato**: Verificar que el tipo es correcto (string, number, boolean, etc.)
2. **Formato**: Validar email, UUID, URL, etc.
3. **Longitud**: Limitar tamaño máximo (ej: email ≤ 254 caracteres)
4. **Rango**: Verificar valores dentro de rangos permitidos

### Ejemplo: `create-magic-link`

```typescript
if (!eventId || !email) {
  return new Response(
    JSON.stringify({ error: "eventId y email son requeridos" }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Validar que el evento existe y está en estado pending
const { data: eventData, error: eventCheckError } = await supabase
  .from("events")
  .select("id, status, organizer_email")
  .eq("id", eventId)
  .single();
```

### Sanitización

Para prevenir XSS en emails HTML:

```typescript
function sanitize(str: string, maxLen: number): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .slice(0, maxLen);
}
```

## 4. Protección contra Ataques

### Rate Limiting

**`send-contact-email`** implementa rate limiting por IP:

```typescript
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hora

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}
```

### Honeypot

Detección de bots mediante campo oculto:

```typescript
// Si el campo "website" viene relleno, es un bot
if (website) {
  return new Response(
    JSON.stringify({ success: true }), // Respuesta silenciosa
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

### CORS

Todos los endpoints tienen CORS configurado:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

## 5. Integración de Stripe

### Validación de Webhooks

Los webhooks de Stripe se validan mediante firma HMAC-SHA256:

```typescript
async function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  // Validar que la firma coincide con el secret
  // Previene webhooks falsificados
}
```

### Claves Seguras

- **`VITE_STRIPE_PUBLISHABLE_KEY`**: Pública, segura para frontend
- **`STRIPE_SECRET_KEY`**: Secreta, solo Edge Functions
- **`STRIPE_WEBHOOK_SECRET`**: Secreta, para validar webhooks

## 6. Auditoría y Monitorización

### Tablas de Auditoría

- **`stripe_events`**: Registro de todos los webhooks de Stripe
- **`stripe_payments`**: Auditoría de transacciones
- **`stripe_invoices`**: Registro de facturas

### Logs

Todas las Edge Functions registran errores en consola:

```typescript
console.error("Error in create-magic-link:", error);
```

### Recomendaciones

1. Configurar **Sentry** o **Datadog** para monitorización centralizada (Fase 1.3)
2. Revisar logs regularmente para detectar patrones anómalos
3. Configurar alertas para errores críticos

## 7. Mejores Prácticas para Desarrolladores

### Commits

1. **Nunca versionear secretos**:
   ```bash
   # ❌ MAL
   git add .env.local
   
   # ✅ BIEN
   git add .env.example
   ```

2. **Pre-commit hooks** (Fase 1.6):
   ```bash
   pnpm install
   npx husky install
   npx lint-staged
   ```

### Code Review

- Revisar que no hay secrets en el código
- Validar que todas las entradas se validan
- Verificar que RLS está habilitado en nuevas tablas

### Dependencias

Mantener dependencias actualizadas:

```bash
pnpm update
pnpm audit
```

## 8. Checklist de Seguridad

- [ ] `.env.local` no está versionado
- [ ] Todas las variables sensibles están en `.env.example`
- [ ] RLS está habilitado en todas las tablas
- [ ] Edge Functions validan todas las entradas
- [ ] Rate limiting está configurado en endpoints públicos
- [ ] Webhooks de Stripe se validan
- [ ] Logs se centralizan (Sentry/Datadog)
- [ ] Secrets se rotan regularmente
- [ ] Dependencias están actualizadas

## 9. Contacto y Reportes de Seguridad

Si descubres una vulnerabilidad:

1. **No la publiques públicamente**
2. Contacta a: `security@tuesdi.es` (si existe)
3. Proporciona detalles técnicos y pasos para reproducir
4. Espera confirmación antes de divulgar

---

**Última actualización**: 2026-06-18
**Versión**: 3.0.2
