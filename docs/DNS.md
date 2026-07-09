# TUESDI — DNS y correo

**Actualizado:** 9 de julio de 2026
Sustituye a `DNS_MIGRATION.md`.

---

## Estado actual

- **Dominio:** `tuesdi.com`, registrado en **Nominalia**.
- **DNS:** gestionado en Nominalia; el dominio está conectado al proyecto de
  Vercel (A/CNAME hacia Vercel) y funciona con SSL.
- **Correo:**
  - **Recepción:** buzón `hola@tuesdi.com` alojado en **Nominalia** (registros
    MX de Nominalia).
  - **Envío transaccional:** **Resend** desde `noreply@tuesdi.com` (registros
    SPF/DKIM de Resend ya verificados en el DNS).
- **Auth:** Site URL de Supabase Auth = `https://tuesdi.com` (no tocar; si
  apunta a `*.vercel.app` el login se rompe entre dominios).

**Con esta configuración todo funciona.** No hay ninguna migración pendiente
ni necesaria.

---

## ⚠️ Si algún día se plantea mover los nameservers a Vercel

Mover los NS de Nominalia a `ns1/ns2.vercel-dns.com` haría que **Vercel pase a
servir TODO el DNS**, no solo la web. Consecuencias si se hace sin preparación:

1. **Se pierde el buzón `hola@tuesdi.com`**: los registros MX de Nominalia
   dejan de existir y el correo entrante rebota. Habría que recrear los MX de
   Nominalia en el DNS de Vercel **antes** del cambio de NS (y confirmar con
   Nominalia que el buzón sigue operativo con NS externos — no todos los
   proveedores lo permiten).
2. **Se rompe el envío de Resend** hasta recrear los TXT de SPF/DKIM/DMARC en
   Vercel.
3. La propagación de NS tarda hasta 24–48 h, durante las cuales conviven
   respuestas de ambos proveedores.

**Recomendación:** no migrar. El único beneficio real sería gestionar DNS
desde el dashboard de Vercel; el riesgo (correo) no lo compensa mientras el
buzón viva en Nominalia. Si se quisiera hacer igualmente, el orden correcto es:

1. Inventariar **todos** los registros actuales en Nominalia
   (`A`, `CNAME`, `MX`, `TXT` — captura de pantalla incluida).
2. Recrearlos íntegros en Vercel → Domains → tuesdi.com → DNS Records.
3. Solo entonces cambiar los NS en Nominalia.
4. Verificar durante 48 h: web (`https://tuesdi.com`), correo entrante
   (enviarse un email a `hola@`), correo saliente (magic link de prueba).
