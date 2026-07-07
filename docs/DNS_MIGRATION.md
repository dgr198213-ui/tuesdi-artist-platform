# 🔄 TUESDI — Zero-Downtime DNS Migration to Vercel

**Documento:** DNS Migration Guide  
**Última actualización:** 7 de julio de 2026  
**Versión:** 3.0.5  
**Registrador actual:** Nominalia (u otro)  
**Tiempo estimado:** 3-4 horas (incluye propagación)

---

## 📋 Pre-Migration Checklist

Antes de empezar, verificar:

```bash
# 1. Verificar DNS actual
nslookup tuesdi.com
dig tuesdi.com +trace
# Debería mostrar: registrador actual (e.g., Nominalia NS)

# 2. Verificar que app está en Vercel
vercel project ls
# Debe mostrar: tuesdi-artist-platform

# 3. Verificar que dominio está en Vercel Dashboard
# Settings → Domains → tuesdi.com
# Estado debe ser: "Awaiting Nameserver Update"

# 4. Asegurar backups de DB
# Supabase Dashboard → Backups → crear manual backup
```

---

## 🎯 Estrategia de Migración

### **Opción A: Ruta Segura (Recomendada — 0 downtime)**

1. **Fase 1:** Apuntar subdominio test (`test-tuesdi.com`) a Vercel (validar)
2. **Fase 2:** Actualizar DNS registrador (cambiar NS records)
3. **Fase 3:** Verificar propagación completa (~24-48h)

**Ventaja:** Sin riesgo, propagación gradual  
**Desventaja:** Requiere esperar propagación DNS

---

### **Opción B: Ruta Rápida (Riesgo bajo — posible 5 min downtime)**

1. Cambiar directamente NS records en registrador
2. Esperar TTL a expirar (máx 5 min)
3. Traffic automáticamente redirige a Vercel

**Ventaja:** Más rápido  
**Desventaja:** Si falla DNS, app caída 5-10 min

---

## ✅ OPCIÓN A: Ruta Segura (RECOMENDADA)

### **Paso 1: Preparar subdominio de prueba (30 min)**

#### En Vercel Dashboard:

```
1. Ir a: Project Settings → Domains
2. Click "Add Domain"
3. Ingresar: test-tuesdi.com
4. Vercel mostrará:
   - CNAME: cname.vercel-dns.com.
   - O: Nameservers si estás usando Vercel DNS
```

#### En tu registrador (Nominalia):

```
1. Iniciar sesión en Nominalia
2. Ir a: Gestionar dominios → tuesdi.com → Gestionar DNS
3. Crear registro CNAME:
   
   Subdominio: test-tuesdi
   Tipo: CNAME
   Valor: cname.vercel-dns.com.
   TTL: 3600 (1 hora)
   
4. Guardar y esperar 5-10 min
```

#### Verificar:

```bash
# Esperar 10 min, luego:
nslookup test-tuesdi.com
# Debe mostrar: cname.vercel-dns.com

dig test-tuesdi.com +short
# Debe mostrar: IP de Vercel (76.76.19.x)

# Test HTTP:
curl -I https://test-tuesdi.com
# Debe retornar: HTTP 200 y certificado SSL válido
```

**Si todo está bien:** ✅ Puedes pasar a Paso 2

---

### **Paso 2: Migrar tráfico principal (10 min)**

Una vez que `test-tuesdi.com` funciona, migrar `tuesdi.com`:

#### En Vercel Dashboard:

```
1. Project Settings → Domains
2. Si aún no está: Click "Add Domain"
3. Ingresar: tuesdi.com
4. Vercel mostrará NS records:
   - ns1.vercel-dns.com.
   - ns2.vercel-dns.com.
   - ns3.vercel-dns.com.
   - ns4.vercel-dns.com.
```

#### En tu registrador (Nominalia):

```
⚠️ CAMBIAR NAMESERVERS (no registros A/MX individuales)

1. Ir a: Gestionar dominios → tuesdi.com → Cambiar servidores DNS
2. Seleccionar: "Usar otros servidores DNS"
3. Reemplazar NS registrador con NS Vercel:
   
   ns1.vercel-dns.com.
   ns2.vercel-dns.com.
   ns3.vercel-dns.com.
   ns4.vercel-dns.com.
   
4. Guardar cambios
5. ⏰ ESPERAR 24-48h para propagación global
```

**NO ELIMINAR nameservers antiguos AÚN** — dejar como fallback

---

### **Paso 3: Verificar propagación (Iterativo)**

Mientras propaga, verificar estado:

```bash
# Verificar NS records apuntan a Vercel:
nslookup -type=NS tuesdi.com

# Debe mostrar:
# tuesdi.com nameserver = ns1.vercel-dns.com.
# tuesdi.com nameserver = ns2.vercel-dns.com.
# ... etc

# Esperar propagación global:
https://www.whatsmydns.net/#NS/tuesdi.com
# Cuando casi todos los resolver muestren Vercel NS: ✅

# Verificar A record apunta a Vercel IP:
dig tuesdi.com +short
# Debe mostrar: 76.76.19.x (Vercel IP)

# Test HTTP final:
curl -I https://tuesdi.com
# HTTP 200 + certificado SSL ✅
```

**Spreadsheet de propagación:**

| Hora | Google DNS | Cloudflare DNS | ISP Local | Status |
|------|-----------|----------------|----------|--------|
| 14:00 | ❌ Old NS | ❌ Old NS | ❌ Old NS | Started |
| 14:30 | ✅ New NS | ❌ Old NS | ❌ Old NS | Propagating |
| 15:00 | ✅ New NS | ✅ New NS | ❌ Old NS | Propagating |
| 16:00 | ✅ New NS | ✅ New NS | ✅ New NS | Complete ✅ |

---

### **Paso 4: Limpiar registrador antiguo (24-48h después)**

Una vez que propagó globalmente:

```
1. Esperar confirmación de propagación completa (48h)
2. En Nominalia: Eliminar NS records antiguos
3. Verificar que SOLO Vercel NS quedan en DNSChecker:
   https://dnschecker.org/
```

---

### **Paso 5: Verificar certificado SSL**

Vercel genera automáticamente, pero validar:

```bash
# Verificar certificado:
openssl s_client -connect tuesdi.com:443 -servername tuesdi.com

# Buscar:
# ✅ Certificate chain: Let's Encrypt
# ✅ CN=*.tuesdi.com o CN=tuesdi.com
# ✅ Not Before / Not After válido

# O simplemente:
curl -vI https://tuesdi.com 2>&1 | grep -A 5 certificate
```

---

## ⚡ OPCIÓN B: Ruta Rápida (Si quieres ser agresivo)

### **Paso 1: Cambiar directamente NS (5 min)**

```
1. En Nominalia: Cambiar NS a Vercel (como arriba)
2. TTL de NS records típicamente 3600s (1 hora)
3. Una vez expirado: traffic va a Vercel
```

**Riesgo:** Si DNS falla, 5-10 min de downtime

### **Paso 2: Monitorear continuamente (30 min)**

```bash
# En loop cada 30 seg:
while true; do
  echo "$(date): $(dig tuesdi.com +short)"
  sleep 30
done

# Deberías ver transición de IP antiguo → Vercel IP
# Si IP = antiguo registrador > 15 min: PROBLEMA
# Solución: Revertir NS a registrador antiguo
```

---

## 🔄 Rollback Plan (Si algo falla)

Si en cualquier momento DNS se rompe:

### **Escenario 1: Propagación lenta (>48h sin cambio)**

```bash
# Forzar flush de DNS locales:
sudo systemctl restart systemd-resolved  # Linux
sudo dscacheutil -flushcache             # macOS
ipconfig /flushdns                        # Windows

# O esperar más, TTL máximo es 48h
```

### **Escenario 2: DNS completamente roto**

```
1. En Nominalia: Volver a NS registrador antiguo
2. Esperar 1 hora máximo para revertir
3. Investigar qué salió mal
```

**NS registrador antiguo (ejemplo Nominalia):**
```
ns1.nominalia.com.
ns2.nominalia.com.
```

---

## 📧 Email Forwarding During Migration

Si usas email en `tuesdi.com` (e.g., `hola@tuesdi.com`):

### **Antes de cambiar NS:**

1. **Nota MX records actuales:**

```bash
nslookup -type=MX tuesdi.com
# Mostará: priority, mail server (e.g., mx.nominalia.com)
```

2. **En Vercel Dashboard — Configurar MX:**

```
Project Settings → Domains → tuesdi.com → DNS Records
→ Add DNS Record
   Type: MX
   Priority: [mismo que registrador antiguo]
   Value: [mismo que registrador antiguo]
   TTL: 3600
```

3. **Verificar después de migración:**

```bash
dig tuesdi.com MX
# Debe seguir apuntando a mail server (Nominalia o Resend)
```

---

## 🛡️ SSL/HTTPS Durante Migración

### **Before Migration:**
```bash
curl -I https://tuesdi.com
# HTTP 200 + SSL certificate válido
```

### **After Migration (Vercel):**
```bash
curl -I https://tuesdi.com
# HTTP 200 + SSL certificate (Let's Encrypt, renovado automáticamente)
```

**Vercel automáticamente:**
- ✅ Genera certificado SSL
- ✅ Renueva cada 60 días
- ✅ Sin intervención manual requerida

---

## 📊 Monitoreo de Migración

### **Monitoreo en tiempo real:**

```bash
#!/bin/bash
# save as: monitor-dns.sh

echo "Starting DNS migration monitoring..."
ORIGINAL_IP=$(dig tuesdi.com +short | grep -o '^[^[:space:]]*')
VERCEL_IP="76.76.19.19"  # Ejemplo IP Vercel

while true; do
  CURRENT_IP=$(dig tuesdi.com +short)
  echo "[$(date)] IP: $CURRENT_IP (was: $ORIGINAL_IP)"
  
  if [[ "$CURRENT_IP" == "$VERCEL_IP"* ]]; then
    echo "✅ Migration complete! Traffic on Vercel."
    break
  fi
  
  sleep 60
done
```

**Ejecutar:**
```bash
chmod +x monitor-dns.sh
./monitor-dns.sh
```

---

## ✅ Post-Migration Checklist

Después de migración completa (48h):

```bash
# 1. Verificar dominio apunta a Vercel
nslookup tuesdi.com
# Esperado: Vercel IP

# 2. Verificar SSL
curl -vI https://tuesdi.com 2>&1 | grep -i "certificate"
# Esperado: Let's Encrypt

# 3. Verificar que app funciona
curl https://tuesdi.com | head -50
# Esperado: HTML de React app

# 4. Verificar Magic Link (crítico para auth)
# Publicar evento test → debería recibir email con link

# 5. Verificar Supabase conecta
# Login como artista → debería funcionar

# 6. Verificar Stripe (si pagos activos)
# Revisar Stripe webhook logs: sin errores de DNS

# 7. Verificar email (si tienes)
# Send test email a hola@tuesdi.com → debería llegar
```

---

## 🆘 Troubleshooting

### **Problema: "DNS_PROBE_FINISHED_NXDOMAIN"**

**Causa:** NS records no actualizados correctamente

**Solución:**
```bash
# 1. Verificar NS en Vercel Dashboard
# Debe mostrar exactamente: ns1-4.vercel-dns.com.

# 2. Verificar que copió correctamente en registrador
nslookup -type=NS tuesdi.com

# 3. Si sigue mostrando NS antiguo > 1 hora:
# → Problema con propagación o TTL alto
# → Contactar soporte registrador

# 4. Mientras se resuelve: volver a NS antiguo
```

---

### **Problema: "Certificate error: SEC_ERROR_UNKNOWN_ISSUER"**

**Causa:** SSL certificate no renovado en Vercel

**Solución:**
```bash
# 1. En Vercel Dashboard: redeploy
vercel deploy --prod

# 2. Esperar 15 min
# Vercel automáticamente genera/renueva cert

# 3. Verificar:
curl -vI https://tuesdi.com 2>&1 | grep "certificate"
```

---

### **Problema: "Email no llega a hola@tuesdi.com"**

**Causa:** MX records no configurados en Vercel

**Solución:**
```bash
# 1. En Vercel Dashboard:
Project Settings → Domains → tuesdi.com
→ DNS Records → Add Record
   Type: MX
   Name: [leave blank for root]
   Value: mx.nominalia.com (o tu mail provider)
   Priority: 10 (o lo que uses)

# 2. Verificar:
dig tuesdi.com MX
# Debe mostrar: mx.nominalia.com

# 3. Si email aún no llega: contactar Nominalia
```

---

## 📞 Support Contacts

| Problema | Contacto | Tiempo |
|----------|----------|--------|
| DNS no propaga | registrador (Nominalia) | 1-24h |
| SSL error | Vercel support | 1-2h |
| Email no funciona | mail provider support | 1-4h |
| Vercel down | Vercel status | Real-time |

---

## 📝 Post-Migration Document

Después de migración, documenta:

```markdown
# DNS Migration - Completed 2026-07-15

**Timeline:**
- 2026-07-07 14:00 — NS records changed in Nominalia
- 2026-07-07 16:00 — Partial propagation (Google DNS)
- 2026-07-08 08:00 — Global propagation complete

**Final State:**
- NS records: ns1-4.vercel-dns.com
- MX records: mx.nominalia.com (email)
- SSL: Let's Encrypt (auto-renewed)
- IP: 76.76.19.x (Vercel)

**Downtime:** 0 minutes (zero-downtime migration)

**Lessons Learned:**
- Propagation took 18 hours (within expected 24-48h)
- Email forwarding required manual MX config
- SSL renewed automatically ✅
```

---

## ✅ Sign-off

**Migración DNS completada:** 7 de julio de 2026  
**Estrategia:** Zero-downtime (Opción A)  
**Soporte:** Vercel / Nominalia

---

**¿Preguntas?** Ver docs/INCIDENT_RESPONSE.md para DNS issues
