# ADR 001 — Tabla canónica `profiles` y cliente Supabase tipado

**Fecha**: 21 junio 2026
**Estado**: Aceptado

## Contexto
Durante una auditoría completa se encontraron referencias dispersas por
todo el frontend (10+ archivos) y varias Edge Functions a una tabla
`artists` que **nunca ha existido** en la base de datos real, además de
columnas inventadas (`event_date`, `artist_id`, `contact_requests`,
`metrics`, `subscription_plan`...) que no coinciden con el esquema real.
Causó bugs en producción no detectados durante meses: ningún artista
podía guardar su perfil, el directorio público fallaba, etc.

## Decisión
1. **`profiles` es la única tabla canónica** para datos de artista.
   `profiles.id` ES `auth.users.id` (relación 1:1 directa, sin columna
   `user_id` separada en `profiles`).
2. **`client/src/lib/database.types.ts` es la fuente de verdad de tipos**,
   generado directamente desde el esquema real de Supabase
   (`generate_typescript_types`). El cliente de Supabase
   (`client/src/lib/supabase.ts`) usa `createClient<Database>(...)`.
3. Regenerar este archivo tras cada migración. Cualquier referencia a una
   tabla/columna que no exista falla la compilación (`pnpm check`) en vez
   de fallar en producción de forma silenciosa.
4. El pipeline de CI (`.github/workflows/ci.yml`) ejecuta `pnpm check`,
   `pnpm test` y `pnpm build` en cada push/PR a `main`. Un PR no debería
   mergearse si esto falla.

## Cómo regenerar los tipos
Usar la herramienta MCP de Supabase (`generate_typescript_types` con el
project_id `nbhaacqjqhpofuvfztkz`), o si tienes el CLI enlazado:
```bash
npx supabase gen types typescript --project-id nbhaacqjqhpofuvfztkz --schema public > client/src/lib/database.types.ts
```

## Consecuencias
- Cualquier commit (propio, de Manus, o de cualquier colaborador futuro)
  que introduzca `.from("artists")` o una columna inexistente romperá
  `pnpm check` inmediatamente, en vez de descubrirse semanas después en
  producción.
- Coste: hay que recordar regenerar `database.types.ts` después de cada
  migración aplicada directamente en Supabase (no solo las que pasan por
  archivos de migración versionados).
