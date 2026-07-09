# TUESDI — Operaciones en producción

**Actualizado:** 9 de julio de 2026
**Contexto:** un solo desarrollador (Dani), plan Vercel Hobby, Supabase Free/Pro, Beta Abierta.

Este documento sustituye a `PRODUCTION_CHECKLIST.md`, `PRODUCTION_READY.md`,
`QUICK_REFERENCE.md` y `OBSERVABILITY.md`. Todo lo que hay aquí es aplicable
hoy con el plan actual; lo que requiere Vercel Pro está marcado como tal.

---

## 1. Estado de partida

- `vercel.json` con headers de seguridad (CSP cerrado, HSTS, X-Frame-Options)
  aplicados a **todas** las rutas (commit `ddb2259`).
- CI en GitHub Actions (`pnpm check` + `pnpm test` + `pnpm build`) con branch
  protection en `main`.
- Rate limiting de eventos por trigger de BD; RLS verificado con `set role anon`.
- No hay métricas históricas de uptime ni MTTR: **no existen hasta que haya
  monitorización**. No inventar números.

---

## 2. Configuración recomendada en Vercel (plan Hobby)

| Ajuste | Dónde | Nota |
|---|---|---|
| Deployment Protection → **solo Preview** | Settings → Deployment Protection | ⚠️ **Nunca activarla sobre Production**: pondría tuesdi.com detrás de un login de Vercel y el sitio quedaría inaccesible para el público. Para los previews sí es útil (evita que URLs `*.vercel.app` de prueba se indexen o se compartan). |
| Speed Insights | Settings → Speed Insights | Gratuito con cuota limitada en Hobby. Da Core Web Vitals reales (LCP, CLS, INP). |
| Web Analytics | Settings → Analytics | Gratuito con cuota en Hobby. Páginas vistas sin cookies. |
| System Environment Variables | Settings → Environment Variables | Verificar que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` están como variables de proyecto (la sintaxis `@secret` de `vercel.json` es legacy). |

**Solo con Vercel Pro** (no necesario en Beta): Log Drains, WAF, Observability
Plus. Reevaluar cuando se activen los pagos.

---

## 3. Monitorización mínima viable (gratis, ~30 min)

El objetivo no es "observabilidad enterprise", es **enterarse antes que los
usuarios**.

1. **Uptime**: UptimeRobot (gratuito, checks cada 5 min) sobre:
   - `https://tuesdi.com` (esperando HTTP 200)
   - `https://xseupkmaosjdrgdsdpmj.supabase.co/functions/v1/get-events`
     (esperando respuesta, aunque sea 4xx: lo que vigilamos es que responda)
   - Alertas → email a `hola@tuesdi.com` y/o al móvil.
2. **Errores de frontend**: Vercel → Logs (retención corta en Hobby, pero
   suficiente para incidentes en caliente).
3. **Errores de backend**: Supabase → Edge Functions → Logs por función, y
   Logs → Postgres para queries lentas.
4. **Coste/consumo**: Supabase → Usage, una vez por semana. Vigilar en
   particular **egress de Storage** cuando los vídeos nativos tengan uso real
   (los `<video preload="none">` protegen, pero cada play descarga el MP4).

Con esto, un incidente se detecta en ≤5 min. No hace falta más hasta tener
tráfico que lo justifique.

---

## 4. Rutina de despliegue

Ya cubierta por las normas de `TUESDI.md` §4.4; resumen operativo:

1. `pnpm check` y `pnpm build` en local (o confiar en el CI, que ejecuta ambos).
2. Push a `main` → Vercel despliega automáticamente.
3. Tras el deploy: abrir tuesdi.com en incógnito y comprobar Home, un perfil
   de artista y `/acceso`. 60 segundos de smoke test manual.
4. Si algo va mal: **Vercel → Deployments → deployment anterior → Promote to
   Production** (rollback instantáneo, no requiere git revert).

---

## 5. Revisión mensual (15 min, día 1 de mes)

- [ ] Supabase Usage: storage, egress, filas de `events` y `magic_links`.
- [ ] UptimeRobot: ¿algún downtime el mes pasado? ¿Se recibió la alerta?
- [ ] Speed Insights: ¿LCP < 2,5 s en móvil? Si empeora, revisar imágenes nuevas.
- [ ] `pnpm outdated`: dependencias con parches de seguridad.
- [ ] Commits del agente Manus desde la última revisión (norma 4.6).
- [ ] Tokens/keys: ¿hay alguno expuesto o antiguo que rotar?

---

## 6. Tareas aplazadas conscientemente

| Tarea | Cuándo reevaluar |
|---|---|
| Self-host de Google Fonts (quitar `fonts.googleapis.com` del CSP) | Con la próxima pasada de rendimiento |
| Log Drains / WAF / tracing distribuido | Al pasar a Vercel Pro o superar ~10k visitas/mes |
| Load testing (k6) | Antes de una campaña de captación grande |
| Status page pública | Cuando haya usuarios de pago |
| hCaptcha en formularios | Si el rate limiting de BD resulta insuficiente (revisar `event_submission_log`) |
