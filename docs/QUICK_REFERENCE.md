# ⚡ TUESDI Quick Reference — Production Cheat Sheet

**Última actualización:** 7 de julio de 2026  
**Versión:** 3.0.5  
**Uso:** Tapar en monitor o imprimir durante incident response

---

## 🚨 INCIDENT QUICK REFERENCE

### **Site Down (HTTP 500)**

```
1. Verify: curl https://tuesdi.com
2. Check: https://www.vercel-status.com
3. Rollback: vercel rollback --yes
4. Wait: 30-60 sec
5. Test: curl https://tuesdi.com
6. Notify: #incidents slack channel
```

**Time Target:** < 5 min

---

### **Magic Link Not Working**

```
1. Check Edge Function logs:
   Supabase → Functions → create-magic-link → Logs

2. Look for:
   - "MAGIC_LINK_SECRET no está configurada" → Secret missing
   - "Failed to send email via Resend" → Email service down
   - "TokenExpiredError" → Token expired

3. Test:
   curl -X POST https://xseupkmaosjdrgdsdpmj.supabase.co/rest/v1/events \
     -H "Authorization: Bearer SERVICE_ROLE_KEY" \
     -H "Content-Type: application/json" \
     -d '{"title":"TEST","event_date":"2026-07-10","organizer_email":"test@gmail.com"}'

4. If no email: Check Resend API key
5. If token invalid: Check MAGIC_LINK_SECRET matches
```

---

### **Database Slow (TTFB > 3s)**

```
1. Identify slow query:
   Supabase → Logs → Filter: duration > 1000

2. Create index:
   CREATE INDEX CONCURRENTLY idx_artists_category ON artists(category);

3. Verify:
   EXPLAIN ANALYZE SELECT * FROM artists WHERE category = 'musica';

4. Purge CDN:
   vercel rebuild

5. Retest: curl -w "%{time_starttransfer}\n" https://tuesdi.com
```

---

### **Payments Failing**

```
1. Check Stripe logs:
   Stripe Dashboard → Developers → Webhooks

2. Check Edge Function:
   Supabase → Functions → create-checkout-session → Logs

3. Verify secret:
   supabase secrets list | grep STRIPE

4. If missing:
   supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_KEY

5. Test webhook:
   stripe trigger payment_intent.succeeded
```

---

### **High Error Rate**

```
1. Find errors:
   Vercel → Logs → Filter: level=error, last 30 min

2. Group by endpoint:
   - If /api/: check Edge Functions
   - If /artistas: check DB query
   - If /auth: check Magic Link flow

3. Filter by function:
   Supabase → Functions → [function] → Logs

4. Escalate if > 1% errors:
   - Page oncall
   - Open war room
   - Start postmortem
```

---

## 📊 MONITORING DASHBOARD LINKS

```
Vercel Analytics:
https://vercel.com/dashboard/[project]/analytics

Supabase Logs:
https://app.supabase.com/project/xseupkmaosjdrgdsdpmj/logs

Stripe Webhooks:
https://dashboard.stripe.com/webhooks

Status Page:
https://status.tuesdi.com (or your custom domain)
```

---

## 🔐 SECRETS & CREDENTIALS

**Where stored:**

```
Vercel Environment Vars:
  Project Settings → Environment Variables

Supabase Edge Functions Secrets:
  supabase secrets list
  supabase secrets set KEY=value

Local .env file:
  .env (gitignored, never commit)
```

**Critical secrets:**

```
✅ VITE_SUPABASE_URL — Frontend config (public)
✅ VITE_SUPABASE_ANON_KEY — Frontend auth key (public)
🔐 SUPABASE_SERVICE_ROLE_KEY — Backend admin (secret)
🔐 MAGIC_LINK_SECRET — Token signing (secret)
🔐 RESEND_API_KEY — Email service (secret)
🔐 STRIPE_SECRET_KEY — Payment processing (secret)
🔐 STRIPE_WEBHOOK_SECRET — Webhook validation (secret)
```

---

## 🔄 COMMON COMMANDS

### **Vercel CLI**

```bash
vercel --version              # Check version
vercel link                   # Link project
vercel env pull               # Pull env vars
vercel logs --tail            # Stream logs
vercel rebuild                # Rebuild & redeploy
vercel rollback --yes         # Rollback to previous
vercel alias set [url]        # Set custom domain
```

### **Supabase CLI**

```bash
supabase login                # Authenticate
supabase link --project-ref=xseupkmaosjdrgdsdpmj
supabase secrets list         # View secrets
supabase secrets set KEY=val  # Set secret
supabase functions deploy [name]
supabase functions logs [name]
```

### **Database Query Shortcuts**

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- View slow queries (require pg_stat_statements)
SELECT query, mean_exec_time FROM pg_stat_statements
WHERE mean_exec_time > 1000 ORDER BY mean_exec_time DESC;

-- Cleanup old data
DELETE FROM magic_links WHERE expires_at < NOW() - INTERVAL '24 hours';
DELETE FROM event_submission_log WHERE created_at < NOW() - INTERVAL '24 hours';

-- Check table sizes
SELECT table_name, pg_size_pretty(pg_total_relation_size(table_name))
FROM information_schema.tables WHERE table_schema = 'public'
ORDER BY pg_total_relation_size(table_name) DESC;
```

---

## 📞 SUPPORT ESCALATION

```
Level 1: Check logs yourself (5 min)
  → Vercel Logs / Supabase Logs / Browser DevTools

Level 2: Google + Stack Overflow (15 min)
  → Search error message + service name

Level 3: Vendor support (30 min - 2 hours)
  → Vercel: support.vercel.com
  → Supabase: support@supabase.io
  → Stripe: dashboard.stripe.com/support
  → Resend: resend.com/support

Level 4: Go offline & sleep (if P4 issue)
  → P3/P2/P1 only warrant urgent attention
```

---

## 🧮 METRICS TARGETS

```
Availability:    > 99.5% (max 21 min downtime/month)
Error Rate:      < 0.5% (max 1 error per 200 requests)
TTFB:            < 1000ms (p95)
LCP:             < 2500ms (p75)
Function Time:   < 10000ms (p95)
Connection Pool: < 80 connections active
```

---

## 🚀 DEPLOYMENT CHECKLIST (Before git push)

```bash
□ pnpm run check          # TypeScript errors?
□ pnpm run test           # Tests pass?
□ git diff --cached       # Review changes
□ git status              # Anything uncommitted?
□ git log -1 --name-only  # What's being deployed?
□ Verify .env vars        # Need to add to Vercel?
□ Smoke test locally      # pnpm dev works?
```

---

## ⏱️ SLA RESPONSE TIMES

```
P1 (Site Down):
  Detection:    < 1 min (alert)
  Acknowledge:  < 2 min (human)
  Mitigate:     < 5 min (fix/rollback)
  Root cause:   < 30 min (investigation)

P2 (Critical feature broken):
  Detection:    < 5 min
  Acknowledge:  < 15 min
  Mitigate:     < 30 min
  Resolve:      < 4 hours

P3 (Degraded performance):
  Detection:    < 1 hour
  Acknowledge:  < 2 hours
  Resolve:      < 24 hours

P4 (Minor bug):
  Fix:          < 1 sprint (can wait)
```

---

## 🔒 SECURITY CHECKLIST

```
Before pushing to main:
□ No secrets in code        (grep -r "sk_live_" .)
□ No API keys logged        (no console.log(apiKey))
□ No SQL injection risk      (using parameterized queries)
□ No XSS risk               (sanitizing user input)
□ CORS properly configured  (allow: tuesdi.com only)
□ Rate limiting in place    (contact/event endpoints)
□ SSL redirect enabled      (force HTTPS)
```

---

## 🎯 WEEKLY TASKS

```
Every Monday 10:00 UTC:
□ Review Vercel Analytics
□ Check Core Web Vitals
□ Review Supabase logs
□ Check SLA tracking
□ Any incidents last week?
□ Preventive maintenance needed?

Every Friday 17:00 UTC:
□ Review costs (Vercel + Supabase)
□ Plan next week priorities
□ Check certificate expiration
```

---

## 💡 QUICK WINS (If bored)

```
1. Self-host Google Fonts
   Time: 1 hour
   Impact: -100-200ms TTFB

2. Create database indexes
   Time: 30 min
   Impact: -1000ms+ on slow queries

3. Add Cache-Control headers
   Time: 15 min
   Impact: -200ms on repeat visits

4. Implement lazy loading for images
   Time: 2 hours
   Impact: -500ms LCP on slow connections

5. Code-split recharts library
   Time: 2 hours
   Impact: -150KB from bundle
```

---

## 🆘 IF ALL ELSE FAILS

```
1. Turn it off and on again
   vercel deploy --prod

2. Check if it's a Vercel outage
   https://www.vercel-status.com

3. Check if it's a Supabase outage
   https://supabase-status.io

4. Check if it's a Stripe outage
   https://status.stripe.com

5. Check DNS propagation
   https://www.whatsmydns.net

6. Deep breath. Call support.
```

---

## 📱 MOBILE SHORTCUTS

**Print this & keep in phone:**

```
Critical Contacts:
- Vercel Support: support.vercel.com
- Supabase Support: support@supabase.io
- Stripe Support: dashboard.stripe.com/support
- Status Page: status.tuesdi.com

If Site Down:
1. vercel rollback --yes
2. Notify #incidents on Slack
3. Check logs for root cause

If Auth Broken:
1. Check MAGIC_LINK_SECRET is set
2. Verify Resend API key
3. Test create-magic-link function

If Payments Down:
1. Check STRIPE_SECRET_KEY
2. Verify webhook endpoint
3. Test in Stripe dashboard
```

---

## ✅ SIGN-OFF

**Quick Reference Sheet:** 7 de julio de 2026  
**For:** Production incident response  
**Keep:** Handy during deployments  

---

**Remember:** When in doubt, check the logs. If logs don't help, check the full docs in `docs/`.

**Full Documentation:**
- `docs/PRODUCTION_CHECKLIST.md` — Comprehensive checklist
- `docs/INCIDENT_RESPONSE.md` — Detailed playbooks
- `docs/DNS_MIGRATION.md` — DNS procedure
- `docs/OBSERVABILITY.md` — Monitoring setup
