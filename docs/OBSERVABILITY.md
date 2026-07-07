# 📊 TUESDI — Observability & Monitoring Guide

**Documento:** Observability Setup  
**Última actualización:** 7 de julio de 2026  
**Versión:** 3.0.5  
**Plan Vercel:** Pro+ (recomendado)

---

## 🎯 Objetivos de Monitoreo

| Métrica | Target | Alert Threshold | Check Frequency |
|---------|--------|-----------------|-----------------|
| **Uptime** | > 99.5% | < 99% | Real-time |
| **TTFB** | < 500ms | > 1s | Every 5 min |
| **LCP** (Core Web Vital) | < 2.5s | > 4s | Daily |
| **Error Rate** | < 0.5% | > 1% | Real-time |
| **Function Timeout** | < 1% | > 0.5% | Real-time |
| **DB Response Time** | < 200ms | > 1s | Real-time |
| **SSL Certificate** | Valid | Expires < 30 days | Daily |

---

## 📍 Stack de Observabilidad

### **Nivel 1: Vercel (Gratuito + Pro)**

```
Vercel Dashboard
├── Deployments (automático)
├── Speed Insights (gratuito)
├── Analytics (Pro+)
└── Logs (real-time)
```

### **Nivel 2: Supabase (Gratuito + Pro)**

```
Supabase Dashboard
├── Database Logs (query performance)
├── Edge Functions Logs
├── Storage Logs
└── Authentication Logs
```

### **Nivel 3: Terceros (Recomendado)**

```
Datadog / New Relic / Splunk
├── Centralized Logging
├── Distributed Tracing
├── APM (Application Performance Monitoring)
├── Alerting & Dashboards
└── SLA/SLO Tracking
```

---

## ✅ Vercel Monitoring Setup

### **1. Speed Insights (Gratuito — Habilitar HOY)**

**En Vercel Dashboard:**

```
Project Settings → Monitoring → Speed Insights
→ Toggle: ON
```

**Qué mide:**
- 📈 Core Web Vitals (LCP, FID, CLS)
- 📊 Real User Monitoring (RUM)
- 🌍 Regional performance
- 📱 Device breakdown (mobile/desktop)

**Dashboard:**
```
Analytics → Speed Insights
→ Ver gráficos de LCP/FID/CLS últimas 7 días
```

**Alertas:**
```
Preguntar a Vercel si LCP > 4s consistente
→ Indicador de problema (lentitud en origen o CDN)
```

---

### **2. Vercel Analytics (Pro+)**

**En Vercel Dashboard:**

```
Project Settings → Monitoring → Analytics
→ Toggle: ON
```

**Qué mide:**
- 🌐 Pageviews / Unique visitors
- 📍 Geografía de usuarios
- 🔗 Top pages / Referrers
- ⏱️ Bounce rate
- 📱 Browser / OS breakdown

**Ejemplo:**
```
Analytics Dashboard
→ 2,345 pageviews (last 7 days)
→ 89% from Spain, 11% international
→ Top pages: /artistas (45%), /home (30%), /eventos (25%)
→ Mobile: 65%, Desktop: 35%
```

---

### **3. Deployment Logs (Automático)**

**En Vercel Dashboard:**

```
Deployments → [latest] → Logs
```

**Tipos de logs:**
- 📝 Build logs (during deployment)
- 🔧 Function logs (during execution)
- ❌ Error logs (if deployment fails)

**Ejemplo:**

```
[14:32:15.123Z] Starting build...
[14:32:45.456Z] Running: pnpm run check
[14:33:12.789Z] ✓ TypeScript check passed
[14:33:20.012Z] Running: pnpm build
[14:34:05.345Z] ✓ Build successful
[14:34:15.678Z] Deploying to CDN...
[14:34:25.901Z] ✓ Deployment complete
```

---

### **4. Function Runtime Logs**

**En Vercel Dashboard:**

```
Deployments → Functions → [function-name] → Logs
```

**Ejemplo para `create-magic-link`:**

```
2026-07-07T14:35:00Z [create-magic-link] Starting invocation
2026-07-07T14:35:00Z [create-magic-link] Event ID: evt_123abc
2026-07-07T14:35:01Z [create-magic-link] Generated token in 45ms
2026-07-07T14:35:02Z [create-magic-link] Email sent to user@example.com
2026-07-07T14:35:02Z [create-magic-link] ✓ Success (2000ms total)
```

---

## 🗄️ Supabase Monitoring Setup

### **1. Database Logs**

**En Supabase Dashboard:**

```
Database → Logs
```

**Filtros útiles:**

```sql
-- Ver queries lentas (> 1s)
level = 'WARNING' AND message LIKE '%duration:%'

-- Ver errores de conexión
level = 'ERROR' AND message LIKE '%connection%'

-- Ver queries por tabla
message LIKE '%artists%'
```

**Ejemplo:**

```
[14:36:15] PostgreSQL: SELECT * FROM artists WHERE category = 'musica'
           Duration: 245ms (normal ✅)

[14:37:22] PostgreSQL: SELECT * FROM media JOIN artists...
           Duration: 5234ms (SLOW ❌)
           → Crear índice urgentemente
```

### **2. Edge Functions Logs**

**En Supabase Dashboard:**

```
Functions → [function-name] → Logs
```

**Formato esperado:**

```
2026-07-07T14:38:00Z Request: POST /functions/v1/create-magic-link
2026-07-07T14:38:01Z Response: 200 OK (1234ms)

2026-07-07T14:39:00Z Request: POST /functions/v1/confirm-event
2026-07-07T14:39:15Z Response: 410 Gone (15000ms) ← TOO SLOW
```

### **3. Authentication Logs**

**En Supabase Dashboard:**

```
Auth → Logs
```

**Eventos a monitorear:**

```
✅ Successful OTP requests: track growth
❌ OTP failures: rate limiting triggered? Token expired?
❌ Session errors: DB connection issue?
✅ Signups: new artists registered
```

---

## 🔔 Setting Up Alerts (Crítico)

### **Opción 1: Vercel Alerts (Gratuito)**

```
Project Settings → Integrations → GitHub
→ Slack (opcional)
```

**Limitaciones:** Solo notificaciones de deployment

### **Opción 2: Datadog (Recomendado para Pro+)**

#### **Instalación:**

```bash
# 1. Crear cuenta en datadog.com (free tier disponible)

# 2. En Vercel Dashboard:
Integrations → Datadog
→ Conectar con Datadog API Key

# 3. Seleccionar eventos:
☑️ Deployments
☑️ Functions
☑️ Errors
☑️ Lambda invocations
```

#### **Crear alerts en Datadog:**

```
Alerts → New Monitor → Metric Alert
```

**Alert 1: High Error Rate**

```
Condition: Average error_rate > 1% over last 5 minutes
Action: Send to #incidents Slack
```

**Alert 2: Function Timeout**

```
Condition: Count of timeouts > 5 over last 10 minutes
Action: Page oncall + notify #incidents
```

**Alert 3: Database Slow Queries**

```
Condition: P95 query duration > 2000ms over last 10 minutes
Action: Send to #database-alerts Slack
```

---

### **Opción 3: Self-hosted con Supabase**

Crear tabla de alertas:

```sql
-- supabase/migrations/20260707_alerts_config.sql

CREATE TABLE IF NOT EXISTS public.alerts_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  metric TEXT NOT NULL, -- 'error_rate', 'ttfb', 'db_duration'
  threshold NUMERIC NOT NULL,
  window_seconds INT DEFAULT 300,
  action TEXT, -- 'email', 'slack', 'pagerduty'
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.alerts_triggered (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES alerts_config,
  value NUMERIC,
  message TEXT,
  triggered_at TIMESTAMPTZ DEFAULT now()
);

-- Insert sample alerts
INSERT INTO alerts_config (name, metric, threshold, action) VALUES
  ('High Error Rate', 'error_rate', 0.01, 'email'),
  ('TTFB Too High', 'ttfb', 1000, 'slack'),
  ('DB Slow', 'db_duration', 2000, 'slack');
```

---

## 📈 Key Metrics to Track

### **1. Uptime & Availability**

**Medir:**
```bash
# Ping endpoint cada 60 seg
curl -I https://tuesdi.com

# Contar requests con status != 200
# Uptime % = (success requests / total requests) * 100
```

**Target:** > 99.5% (máximo 1h downtime/mes)

**Dashboard:**
```
Uptime check results (last 30 days):
✅ 99.8% — Excellent
```

---

### **2. Response Times (TTFB)**

**Medir:**
```bash
curl -w "%{time_starttransfer}" https://tuesdi.com
```

**Targets:**
- ✅ < 500ms: Excellent
- ⚠️ 500ms - 1s: Acceptable
- ❌ > 1s: Degrade user experience

**Drill-down:**

```
TTFB Breakdown (last 7 days):
- Desktop:   320ms (good)
- Mobile:    450ms (good)
- 4G:        890ms (borderline)
- 3G:       2100ms (poor - but unavoidable)
```

---

### **3. Core Web Vitals**

**LCP (Largest Contentful Paint)**
```
Target: < 2.5s
Alert: > 4s
Measure: When largest visible element renders
```

**FID (First Input Delay)**
```
Target: < 100ms
Alert: > 300ms
Measure: When browser responds to user input
```

**CLS (Cumulative Layout Shift)**
```
Target: < 0.1
Alert: > 0.25
Measure: Unexpected layout shifts during page load
```

**View in Vercel:**
```
Analytics → Speed Insights
→ See LCP/FID/CLS percentiles (p50, p75, p95)
```

---

### **4. Error Rate**

**Medir:**
```
error_rate = (HTTP 5xx errors / total requests) * 100
```

**Targets:**
- ✅ < 0.1%: Excellent
- ⚠️ 0.1% - 0.5%: Acceptable
- ❌ > 0.5%: Alert immediately

**Ejemplo:**

```
Last 24 hours: 100,000 requests
✅ Errors: 0 (0%)

Last week: 700,000 requests
⚠️ Errors: 245 (0.035%) - within SLA

Last month: 3,000,000 requests
❌ Errors: 18,000 (0.6%) - SLA violated
```

---

### **5. Function Performance**

**Por función:**

| Function | Avg Time | P95 | P99 | Errors |
|----------|----------|-----|-----|--------|
| create-magic-link | 450ms | 890ms | 1200ms | 0 |
| confirm-event | 220ms | 450ms | 780ms | 0 |
| get-events | 1200ms | 2500ms | 4000ms | 2 |
| send-contact-email | 890ms | 1500ms | 2100ms | 0 |

**Alert si:**
- P95 > 10 seg (timeout inminente)
- Error rate > 1%
- Última invocación > 30 seg

---

### **6. Database Metrics**

**Connection Pool:**
```sql
SELECT 
  count(*) as active_connections,
  max(now() - query_start) as longest_query_duration
FROM pg_stat_activity
WHERE datname = 'postgres';
```

**Alert si:**
- active_connections > 80 (near limit)
- longest_query_duration > 60s

**Query Performance:**
```sql
SELECT 
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC
LIMIT 5;
```

**Alert si:**
- mean_exec_time > 2000ms (> 2s)
- spike en max_exec_time

---

## 🎛️ Creating a Monitoring Dashboard

### **Vercel Built-in Dashboard**

```
Analytics → Overview
Shows:
  - Speed Insights (LCP/FID/CLS)
  - Pageviews & Unique visitors
  - Top pages & referrers
  - Regional distribution
```

### **Datadog Custom Dashboard**

```
Create Dashboard with widgets:

1. Uptime check status (green/red)
2. Error rate gauge (0-100%)
3. TTFB graph (over time)
4. Function invocation count (stacked bar)
5. Core Web Vitals percentile graph
6. Database connection pool (current)
7. Recent alerts (table)
```

**Dashboard URL:**
```
https://datadoghq.com/dashboard/abc123?...
```

---

## 🚨 Alert Severity Levels

### **P1 (Critical — Page Immediately)**

```
- Uptime < 99%
- Error rate > 5%
- All functions timing out
- Database unreachable
```

**Action:** Declare incident, follow INCIDENT_RESPONSE.md

---

### **P2 (High — Alert in 5 min)**

```
- TTFB > 3s consistently
- Error rate 1-5%
- Magic Link broken
- Payments failing
```

**Action:** Investigate & fix within 15 min

---

### **P3 (Medium — Alert in 1 hour)**

```
- LCP > 4s
- Slow query (> 2s)
- Rate limiting active
```

**Action:** Fix within 24h, post-mortem later

---

### **P4 (Low — Daily summary)**

```
- Typo in UI
- CSS bug
- Unused endpoint returning 404
```

**Action:** Fix in next sprint

---

## 📋 SLO (Service Level Objectives)

Define what "production ready" means:

```
Monthly SLOs:

Availability: 99.5%
  → Max downtime: 21.6 minutes/month

Error Rate: < 0.5%
  → Max errors: 1 in 200 requests

TTFB: < 1s (p95)
  → 95% of requests must respond < 1s

LCP: < 2.5s (p75)
  → 75% of sessions load main content < 2.5s

Function Success Rate: 99.9%
  → Max function errors: 1 in 1000 invocations
```

**Track monthly:**
```
Month of July:
- Availability: 99.87% ✅ (exceeds 99.5%)
- Error Rate: 0.12% ✅ (under 0.5%)
- TTFB (p95): 890ms ✅ (under 1s)
- LCP (p75): 2.1s ✅ (under 2.5s)
```

---

## 📊 Weekly Review Cadence

**Every Monday 10:00 UTC:**

```
1. Open Vercel Analytics
   - Check uptime last week
   - Review Core Web Vitals
   - Identify top errors

2. Open Supabase Logs
   - Review slow queries
   - Check DB connection pool
   - Look for patterns

3. Review incidents from previous week
   - Any P1/P2? Why?
   - Preventive measures taken?

4. Update SLO tracking
   - Are we on track for monthly goals?
   - Any trends (improving/degrading)?

5. Plan optimization work
   - If TTFB trending up: investigate why
   - If error rate trending up: on-call review
```

---

## 🔍 Debugging with Logs

### **Scenario 1: User reports "page took 10 seconds to load"**

```
1. Vercel Analytics → Speed Insights
   - Check LCP at that time
   - See if spike recorded

2. Vercel Logs → Search timestamp
   - Any function timeout?
   - Any 5xx errors?

3. Supabase Logs → Search timestamp
   - Any slow queries?
   - Any connection errors?

4. Browser DevTools (if you have)
   - Performance tab
   - Network tab
   - See what loaded slow
```

---

### **Scenario 2: Stripe webhook failing**

```
1. Stripe Dashboard → Webhooks → Logs
   - See failing event
   - Check response status

2. Supabase Functions Logs → create-checkout-session
   - See if function got invoked
   - Any error messages?

3. Supabase Database Logs
   - Did subscription get created?
   - Any constraint violations?

4. Vercel Logs → Search timestamp
   - Edge Function logs
   - Any timeouts?
```

---

## ✅ Monthly Monitoring Checklist

```bash
# 1st of each month:

- [ ] Review SLO report
  - Uptime %
  - Error rate
  - TTFB (p95)
  - LCP (p75)

- [ ] Check SSL certificate expiration
  - Vercel → Domains
  - Should show renewal date
  - Vercel auto-renews, but verify

- [ ] Review alerts
  - Any false positives?
  - Need to adjust thresholds?

- [ ] Database maintenance
  - Check VACUUM progress
  - Review query performance
  - Are indexes being used?

- [ ] Cost review (Vercel)
  - Bandwidth usage trending?
  - Function invocations trending?
  - Any spikes to investigate?

- [ ] Update this doc
  - Any new alerts added?
  - Thresholds changed?
  - New dashboards created?
```

---

## 📞 Monitoring Tools Recommendations

| Tool | Cost | Use Case |
|------|------|----------|
| **Vercel Native** | Free | Speed Insights, Deployment logs |
| **Datadog** | $15-50/mo | Centralized monitoring, APM |
| **New Relic** | $0-500+/mo | Enterprise APM |
| **Sentry** | Free-99/mo | Error tracking |
| **Uptime Robot** | Free | Simple uptime monitoring |
| **StatusPage.io** | $29-499/mo | Public status page |

**For TUESDI v3.0.5:**
- Start with: Vercel Native + Supabase Logs (free)
- Add when Pro: Datadog ($15/mo)
- Add if Enterprise: New Relic + StatusPage.io

---

## ✅ Sign-off

**Observability Setup:** 7 de julio de 2026  
**Review Frequency:** Monthly  
**Next Review:** 1 de agosto de 2026

---

**Questions?** See docs/INCIDENT_RESPONSE.md for alert runbooks
