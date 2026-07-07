# 🚨 TUESDI — Incident Response Runbook

**Última actualización:** 7 de julio de 2026  
**Versión:** 3.0.5  
**Criticidad:** P1 (Production Down) a P4 (Minor Bug)

---

## 📋 Tabla de Contenidos

1. [Escalas de Severidad](#escalas-de-severidad)
2. [Incidentes Comunes](#incidentes-comunes)
3. [Contactos de Escalamiento](#contactos-de-escalamiento)
4. [Postmortem & Lecciones](#postmortem--lecciones)

---

## 🎯 Escalas de Severidad

### 🔴 **P1: Crítico — Sitio completamente inoperativo**

**Indicadores:**
- ❌ Sitio retorna HTTP 500
- ❌ Todas las páginas lanzan errores
- ❌ Base de datos inaccesible
- ❌ Edge Functions en timeout permanente

**Objetivo de resolución (RTO):** < 5 minutos  
**Objetivo de pérdida de datos (RPO):** 0 (sin pérdida)

**Quién detecta:**
- Alerta automática de Vercel
- Alerta de Datadog (cuando esté habilitado)
- Usuario reporta en Twitter/email
- Tú mismo (si estás monitoreando)

---

### 🟠 **P2: Alta — Funcionalidad crítica degradada**

**Indicadores:**
- ⚠️ Autenticación rota (Magic Link no funciona)
- ⚠️ Pagos rechazados (Stripe API error)
- ⚠️ DB lenta (queries > 10s)
- ⚠️ TTFB > 3 segundos consistente
- ⚠️ Publicación de eventos bloqueada

**Objetivo de resolución (RTO):** < 15 minutos  
**Objetivo de pérdida de datos (RPO):** < 1 minuto

**Quién detecta:**
- Usuarios reportan en la app ("No puedo hacer login")
- Speed Insights alerta (LCP > 4s)
- Stripe webhook failures en logs

---

### 🟡 **P3: Medio — Funcionalidad no crítica degradada**

**Indicadores:**
- 🟡 Galería de imágenes lenta
- 🟡 Analytics mostrandö datos stale
- 🟡 Rate limiting activado (muchos requests)
- 🟡 Búsqueda de artistas retorna resultados parciales

**Objetivo de resolución (RTO):** < 1 hora

---

### 🟢 **P4: Bajo — Bugs menores sin impacto a usuarios**

**Indicadores:**
- 🟢 Typo en la UI
- 🟢 CSS de un botón roto
- 🟢 Endpoint no usado que falla
- 🟢 Log warning (no error)

**Objetivo de resolución (RTO):** < 24 horas

---

## 🚨 Incidentes Comunes

---

### **INCIDENTE 1: Sitio retorna HTTP 500 (P1)**

#### **Paso 1: Confirmar el alcance (30 seg)**

```bash
# En terminal:
curl -v https://tuesdi.com 2>&1 | head -20
# Buscas: HTTP/2 500 o similar

# Alternativamente:
# Abre DevTools → Network → Refresh
# Si ves rojo (5xx): es real

# Verificar status page de Vercel:
# https://www.vercel-status.com
# ¿Hay incident report? → es problema de Vercel
```

#### **Paso 2: Revisar logs (1 min)**

**En Vercel Dashboard:**
```
Project → Logs
→ Filtrar: last 5 minutes, level: error
```

**En Supabase:**
```
Database → Logs
→ Ver si hay: "connection timeout", "out of connections"
```

#### **Paso 3: Ejecutar rollback (30 seg)**

```bash
# Opción 1: CLI (más rápido)
vercel rollback --yes
# Esperar 30-60 seg a que Vercel redeploy

# Opción 2: Dashboard
Deployments → Última deployment buena
→ Click "Redeploy" (o "Promote to Production")
```

#### **Paso 4: Verificar recuperación (30 seg)**

```bash
curl https://tuesdi.com
# Esperar HTTP 200

# O abrir en navegador:
# https://tuesdi.com → debería cargar
```

#### **Paso 5: Investigar root cause (5-10 min)**

**Preguntas:**
- ¿Cuándo fué el último deployment? (`git log --oneline -n 5`)
- ¿Qué cambió? (`git diff HEAD~1 HEAD`)
- ¿Error en Edge Function? (`supabase functions logs`)
- ¿Error en cliente? (`vercel logs --tail` o DevTools Console)

**Checklist de causas comunes:**
- [ ] Variables de entorno faltando (Vercel Settings → Environment)
- [ ] Supabase API key expirada/revocada
- [ ] Migración de DB incompleta
- [ ] TypeScript error no capturado (verifica `pnpm check`)
- [ ] Disk space en Supabase (improbable, pero revisar)

#### **Paso 6: Notificar stakeholders**

```markdown
# 🚨 Incident Report - TUESDI DOWN

**Duración:** 2026-07-07 15:30 → 15:35 UTC (5 min)
**Severidad:** P1
**Root cause:** Edge Function timeout (MAGIC_LINK_SECRET missing)
**Resolución:** Rollback deployment #123

**Acciones tomadas:**
1. Executed rollback to deployment #122
2. Verified Magic Link functions redeployed
3. Added environment variable validation in CI

**Próximas acciones:**
- [ ] Audit all environment variables in Vercel
- [ ] Add monitoring alert for function timeouts
```

---

### **INCIDENTE 2: Magic Link no funciona (P2)**

#### **Síntomas:**
- Usuario no recibe email de confirmación
- Click en link muestra "Token inválido"
- "Este enlace ha caducado"

#### **Paso 1: Revisar Edge Function logs**

**En Supabase Dashboard:**
```
Functions → create-magic-link → Logs
→ Filtrar último 30 min
```

**Buscar errores comunes:**

```
❌ "Variable de entorno requerida: MAGIC_LINK_SECRET no está configurada."
   → Solución: Supabase Settings → Edge Functions → Secrets
              → Verificar MAGIC_LINK_SECRET está seteado

❌ "Failed to send email via Resend"
   → Solución: Revisar RESEND_API_KEY, check Resend API status

❌ "TokenExpiredError"
   → Solución: Verificar token_hash en BD, validar fecha de expiración
```

#### **Paso 2: Verificar base de datos**

```sql
-- En Supabase SQL Editor
SELECT 
  id, 
  event_id, 
  created_at, 
  expires_at, 
  used,
  (expires_at < NOW()) as is_expired
FROM magic_links
ORDER BY created_at DESC
LIMIT 10;

-- Si ves is_expired = true y used = false:
-- El token expiró antes de que usuario haga click
-- Revisar: ¿Expiración configurada correctamente? (default: 24h)
```

#### **Paso 3: Test manual**

```bash
# Publicar evento de prueba manualmente:
curl -X POST https://xseupkmaosjdrgdsdpmj.supabase.co/rest/v1/events \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "TEST EVENT",
    "event_date": "2026-07-10",
    "organizer_email": "test@gmail.com"
  }'

# Esperar email en test@gmail.com
# Si no llega → problema con Resend
# Si llega pero token es inválido → problema con HMAC
```

#### **Paso 4: Revisar HMAC signature**

```typescript
// En supabase/functions/_shared/magic-token.ts
// Verificar que generateToken y verifyToken usan MISMO SECRET

// Si MAGIC_LINK_SECRET cambió recientemente:
// → Todos los tokens antiguos son inválidos
// → Solución: No cambiar secret en producción
```

#### **Paso 5: Reenviar links expirados**

Si usuarios reportan "link expirado":

```sql
-- Crear nuevos tokens para eventos pendientes
UPDATE magic_links
SET expires_at = NOW() + INTERVAL '24 hours'
WHERE event_id IN (
  SELECT id FROM events WHERE status = 'pending'
)
AND expires_at < NOW();

-- Y reenviar email manually via Resend API
-- (o agregar endpoint /resend-event-link en futuro)
```

---

### **INCIDENTE 3: Base de datos lenta (P2)**

#### **Síntomas:**
- Página de artistas tarda > 5 seg en cargar
- Directorio de eventos congelado
- Dashboard metric queries timeout

#### **Paso 1: Revisar query performance**

**En Supabase → Logs:**
```
Logs → Database Logs → Filter: Slow Queries
```

**O via SQL:**
```sql
-- Mostrar queries lentas (requiere pg_stat_statements extension)
SELECT 
  query,
  calls,
  mean_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000  -- > 1 segundo
ORDER BY mean_exec_time DESC
LIMIT 10;
```

#### **Paso 2: Identificar causa**

**Preguntas:**
- ¿Table scan (sin índice)? → Crear índice
- ¿JOIN mal optimizado? → Reescribir query
- ¿Supabase bajo recursos?  → Upgrade plan (Pro+ tiene más CPU)
- ¿Connection pool exhausted?  → Revisar cuántas conexiones activas

**Verificar connection pool:**
```sql
SELECT 
  datname,
  count(*) as connections
FROM pg_stat_activity
GROUP BY datname
ORDER BY count(*) DESC;

-- Si > 90 conexiones: problema de pool
-- Solución: Aumentar JDBC pool size en Supabase
```

#### **Paso 3: Crear índice urgente**

```sql
-- Si queries slow son en tabla artists con filtro por category:
CREATE INDEX CONCURRENTLY idx_artists_category 
ON artists(category);

-- CONCURRENTLY = no bloquea tabla (important en prod)

-- Verificar índices existentes:
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;
```

#### **Paso 4: Optimizar query**

**Antes (lento):**
```sql
SELECT * FROM artists 
JOIN metrics ON artists.id = metrics.artist_id
WHERE artists.category = 'musica'
ORDER BY metrics.profile_views DESC;
-- Problema: JOIN sin índice en metrics.artist_id
```

**Después (rápido):**
```sql
-- Asegurar índices:
CREATE INDEX idx_metrics_artist_id ON metrics(artist_id);

-- Query optimizada:
SELECT 
  a.id, a.slug, a.artist_name, a.profile_image,
  COALESCE(m.profile_views, 0) as views
FROM artists a
LEFT JOIN metrics m ON a.id = m.artist_id
WHERE a.category = 'musica'
ORDER BY views DESC
LIMIT 20;
-- Plus: LIMIT evita traer todas las filas
```

#### **Paso 5: Monitorear**

Agregar alerta en Supabase:
```
Logs → Create Alert
Condition: mean_exec_time > 2000
Action: Send Email
```

---

### **INCIDENTE 4: Pagos no procesan (P1)**

#### **Síntomas:**
- Usuario intenta upgrade a "Pro" → error "Unauthorized"
- Stripe dashboard muestra "webhook failed"
- Sessions de checkout quedan incompletas

#### **Paso 1: Revisar Stripe webhook logs**

**En Stripe Dashboard:**
```
Developers → Webhooks → tuesdi
→ Ver eventos fallidos (rojo)
```

**Causas comunes:**
- `unauthorized` — STRIPE_SECRET_KEY incorrecto
- `timeout` — Edge Function lentas (> 30s)
- `invalid_payload` — Cambio en schema de evento

#### **Paso 2: Revisar Edge Function logs**

**En Supabase:**
```
Functions → create-checkout-session → Logs
```

**Buscar:**
```
❌ "No autorizado: falta token de autenticación"
   → Cliente no envía Authorization header
   
❌ "Stripe API error: Invalid API Key"
   → STRIPE_SECRET_KEY expiró o es del sandbox
   
❌ "priceId, plan y artistId son requeridos"
   → Frontend no envía datos completos
```

#### **Paso 3: Verificar configuration**

```bash
# En terminal (si tienes acceso a Supabase CLI):
supabase secrets list | grep STRIPE

# Debe mostrar:
# STRIPE_SECRET_KEY=sk_live_... (o sk_test_...)
# STRIPE_WEBHOOK_SECRET=whsec_...

# Si falta alguno:
supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_KEY
```

#### **Paso 4: Test manual**

```bash
# Crear session de checkout de prueba:
curl -X POST https://xseupkmaosjdrgdsdpmj.supabase.co/functions/v1/create-checkout-session \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_1234...",
    "plan": "pro",
    "artistId": "uuid-here"
  }'

# Si responde con URL de Stripe: ✅ funciona
# Si error 401: problema de autenticación
# Si error 403: usuario no es dueño del artista
```

#### **Paso 5: Notificar usuarios afectados**

```markdown
We're temporarily unable to process upgrades.
Our team is investigating. Please try again in 10 minutes.
If issue persists, email support@tuesdi.com

Status: https://status.tuesdi.com
```

---

### **INCIDENTE 5: TTFB alto / Sitio lento (P2)**

#### **Síntomas:**
- Página tarda > 3 seg en cargar
- Speed Insights muestra LCP > 4s
- Usuarios reportan "spinner infinito"

#### **Paso 1: Medir actual TTFB**

```bash
curl -w "@curl-format.txt" -o /dev/null -s https://tuesdi.com

# Si no tienes curl-format.txt:
curl -w "TTFB: %{time_starttransfer}s\n" -o /dev/null -s https://tuesdi.com
```

**Benchmarks esperados:**
- ✅ TTFB < 500ms (bueno)
- ⚠️ TTFB 500-1000ms (aceptable)
- ❌ TTFB > 1000ms (degradado)

#### **Paso 2: Identificar cuello de botella**

**¿Es CDN/Vercel?** → TTFB desde ubicación lejana

```bash
# Desde región diferente:
curl -w "TTFB: %{time_starttransfer}s\n" https://tuesdi.com
# Si todo slow: problema regional
```

**¿Es generación de HTML?** → Verificar en función Edge

```bash
# En Vercel Logs:
curl https://api.vercel.com/v13/deployments/DEPLOYMENT_ID/logs?...
# Ver si tiene: "function start", "function end"
```

**¿Es data fetching (Supabase)?** → Revisar query speed

```sql
-- En Supabase Logs, ver slow queries
-- Si alguna > 1s: optimizar query (crear índice)
```

#### **Paso 3: Aplicar quick fixes**

**Fix 1: Purgar caché de CDN**

```bash
vercel env pull  # traer vars de entorno
vercel rebuild   # forzar rebuild
# O en Dashboard: Deployments → [latest] → ... → Redeploy
```

**Fix 2: Verificar cache headers**

```bash
curl -I https://tuesdi.com | grep Cache-Control
# Debe mostrar: Cache-Control: public, max-age=3600, ...
```

**Fix 3: Habilitar compresión**

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Encoding", "value": "gzip" }
      ]
    }
  ]
}
```

#### **Paso 4: Revisar recursos pesados**

**En DevTools (Browser):**
```
F12 → Network → Load Page
→ Ver bundle sizes
```

**Si vendor.js > 1MB:**
```bash
# Revisar qué librerías innecesarias se están cargando
pnpm build --report

# Considerar code-splitting recharts + supabase-js
```

---

### **INCIDENTE 6: Event submission bloqueado (P2)**

#### **Síntomas:**
- Usuario intenta publicar evento → "Has alcanzado el límite de eventos por hora"
- Aunque sea primera publicación
- O límite global: "Sistema recibiendo muchas solicitudes"

#### **Paso 1: Revisar rate limiting logs**

**En Supabase SQL:**
```sql
SELECT 
  email,
  COUNT(*) as attempts,
  MAX(created_at) as last_attempt
FROM event_submission_log
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY email
ORDER BY attempts DESC;
```

#### **Paso 2: Identificar causa**

**Si usuario legítimo fue rate-limited:**

```sql
-- Ver si intentó > 3 veces:
SELECT * FROM event_submission_log
WHERE email = 'user@example.com'
AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Si ves > 3 intentos: rate limit funcionando bien
-- Mensaje es correcto, esperar 1 hora
```

**Si es bot/spam:**

```sql
-- Ver emails con muchos intentos:
SELECT email, COUNT(*) as count
FROM event_submission_log
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY email
HAVING COUNT(*) > 10
ORDER BY count DESC;

-- Si ves muchos emails diferentes en corto tiempo:
-- Bot usando diferentes emails
-- Solución: Aumentar rate limit global (es un ataque leve)
```

#### **Paso 3: Limpiar log obsoleto**

```sql
-- Limpiar logs > 24 horas (automático vía cron)
DELETE FROM event_submission_log 
WHERE created_at < NOW() - INTERVAL '24 hours';
```

#### **Paso 4: Comunicar a usuario**

Si fue bloqueado legítimamente:
```
Por tu seguridad, limitamos eventos a 3 por hora.
Vuelve a intentar después de las 16:30 UTC.
```

---

## 📞 Contactos de Escalamiento

### **Nivel 1: Verificación Rápida (Tú - 5 min)**

```
1. ¿Vercel status page ok? → https://www.vercel-status.com
2. ¿Mi app retorna 200? → curl https://tuesdi.com
3. ¿Logs muestran algo? → Vercel Dashboard → Logs
```

### **Nivel 2: Escalamiento a Soporte (15 min)**

| Servicio | Urgencia | Contacto | Tiempo Respuesta |
|----------|----------|----------|-----------------|
| **Vercel** | P1-P2 | support.vercel.com | 15-30 min |
| **Supabase** | P1-P2 | support@supabase.io | 30-60 min |
| **Stripe** | P1-P2 | dashboard.stripe.com/support | 15-30 min |
| **Resend** | P2-P3 | resend.com/support | 1-2 hours |

### **Nivel 3: Escalamiento Interno**

**Si eres único operador:**
- Ejecutar playbooks arriba
- Documentar qué sucedió
- Postmortem dentro de 24h

**Si tienes equipo:**
- Contactar CTO/Owner vía Slack #incidents
- Nominar incident commander
- Abrir war room si P1/P2

---

## 📝 Postmortem & Lecciones

Después de cualquier incident P1/P2:

### **Template de Postmortem (24h después)**

```markdown
# Postmortem: [Título del Incident]

**Fecha:** 2026-07-07  
**Duración:** 2026-07-07 15:30 → 15:45 UTC (15 min)  
**Severidad:** P2  
**Impacto:** 150 users unable to publish events  

## Timeline
- 15:30 — Alert: Event submission failing
- 15:32 — Investigated rate_limit_log table
- 15:35 — Found global limit at 20 req/hr exhausted
- 15:40 — Cleaned old logs (DELETE from >24h ago)
- 15:45 — Verified recovery, users able to publish again

## Root Cause
Rate limiting cleanup job didn't run due to pg_cron connection pool issue.
Event submission log grew unbounded, causing false positives.

## Resolution
1. Restarted pg_cron extension
2. Manually cleaned logs
3. Increased retention to 48h

## Prevention
- [ ] Add alerting for rate_limit_log table size
- [ ] Increase frequency of cleanup job (hourly → every 15 min)
- [ ] Add circuit breaker: if cleanup fails 3x, page oncall

## Action Items
- [ ] Implement table size monitoring
- [ ] Update cron schedule
- [ ] Add alerting

**Owner:** @dgr198213-ui  
**Deadline:** 2026-07-10
```

### **Lessons Learned Database**

Mantener spreadsheet de todos los incidents:

| Date | Title | Severity | Duration | Root Cause | Prevention |
|------|-------|----------|----------|-----------|-----------|
| 2026-07-07 | Rate limit cleanup | P2 | 15 min | pg_cron failed | Hourly monitoring |
| ... | ... | ... | ... | ... | ... |

---

## 🔄 Drill Exercises

**Cada mes, simular:**

1. **Drill 1:** Ejecutar rollback (Monday)
2. **Drill 2:** Investigar timeout en Edge Function (Wednesday)
3. **Drill 3:** Escribir postmortem ficticio (Friday)

```bash
# Drill 1: Rollback practice
git log --oneline | head -5
# Simular rollback a commit anterior
vercel rollback --yes
# Verificar que funciona
curl https://tuesdi.com
```

---

## ✅ Sign-off

**Documento creado:** 7 julio 2026  
**Próxima revisión:** 1 septiembre 2026  
**Responsable:** dgr198213-ui (Manus para escalamiento)

---

**¿Pregunta sobre un incident no cubierto?** Abre issue en GitHub o contacta al soporte de Vercel/Supabase.
