# TUESDI v3.0 — Guía de Desarrollo

Guía completa para desarrolladores que trabajan en el proyecto TUESDI.

## 📋 Requisitos Previos

- **Node.js**: 22.x o superior
- **pnpm**: 10.x o superior
- **Git**: 2.x o superior
- **Supabase CLI**: Para gestionar migraciones y Edge Functions
- **Stripe CLI**: Para probar webhooks localmente

## 🚀 Inicio Rápido

### 1. Clonar el Repositorio

```bash
git clone https://github.com/dgr198213-ui/tuesdi-artist-platform.git
cd tuesdi-artist-platform
```

### 2. Instalar Dependencias

```bash
pnpm install
```

### 3. Configurar Variables de Entorno

```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

### 4. Iniciar Servidor de Desarrollo

```bash
pnpm run dev
```

El servidor estará disponible en `http://localhost:5173`.

## 🏗️ Estructura del Proyecto

```
tuesdi-artist-platform/
├── client/                    # Aplicación React (frontend)
│   ├── src/
│   │   ├── components/       # Componentes React reutilizables
│   │   ├── pages/            # Páginas (rutas)
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilidades y constantes
│   │   ├── contexts/         # Context API
│   │   └── App.tsx           # Componente raíz
│   └── public/               # Archivos estáticos
├── supabase/                 # Configuración de backend
│   ├── functions/            # Edge Functions (Deno)
│   └── migrations/           # Migraciones SQL
├── package.json              # Dependencias y scripts
└── vite.config.ts            # Configuración de Vite
```

## 🔧 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `pnpm run dev` | Inicia servidor de desarrollo |
| `pnpm run build` | Construye para producción |
| `pnpm run preview` | Previsualiza build de producción |
| `pnpm run check` | Valida tipos con TypeScript |
| `pnpm run format` | Formatea código con Prettier |
| `pnpm run test` | Ejecuta tests con Vitest |

## 📝 Convenciones de Código

### Nombrado

- **Componentes**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useSupabase.ts`)
- **Utilidades**: camelCase (`formatDate.ts`)
- **Constantes**: UPPER_SNAKE_CASE (`PLAN_LIMITS`)

### Estructura de Componentes

```typescript
/**
 * ComponentName — Descripción breve del componente
 * Qué hace, cuándo usarlo, dependencias especiales
 */

import { useState } from "react";
import { useSupabase } from "@/hooks/useSupabase";

interface ComponentNameProps {
  title: string;
  onClose?: () => void;
}

export default function ComponentName({ title, onClose }: ComponentNameProps) {
  const [state, setState] = useState(false);

  return (
    <div>
      <h1>{title}</h1>
    </div>
  );
}
```

### Imports

```typescript
// 1. Imports de React/librerías externas
import { useState } from "react";
import { format } from "date-fns";

// 2. Imports de proyecto
import { useSupabase } from "@/hooks/useSupabase";
import { PLAN_LIMITS } from "@/lib/constants";

// 3. Imports de componentes
import Button from "@/components/Button";
```

## 🗄️ Gestión de Base de Datos

### Migraciones

Las migraciones se encuentran en `/supabase/migrations/`.

#### Crear una nueva migración

```bash
# Crear archivo SQL
touch supabase/migrations/007_nueva_feature.sql

# Editar el archivo con los cambios SQL
# Luego aplicar en Supabase Dashboard
```

#### Aplicar migraciones

```bash
# Usando Supabase CLI
supabase migration up

# O manualmente en Supabase Dashboard → SQL Editor
```

### Edge Functions

Las Edge Functions están en `/supabase/functions/`.

#### Crear una nueva Edge Function

```bash
# Crear directorio
mkdir supabase/functions/my-function

# Crear archivo index.ts
touch supabase/functions/my-function/index.ts
```

#### Estructura de una Edge Function

```typescript
// supabase/functions/my-function/index.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    // Tu lógica aquí
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Error interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

#### Llamar una Edge Function desde el frontend

```typescript
const supabase = useSupabase();

const response = await supabase.functions.invoke("my-function", {
  body: { key: "value" },
});

if (response.error) {
  console.error("Error:", response.error);
} else {
  console.log("Success:", response.data);
}
```

## 🔐 Seguridad

### Gestión de Secretos

1. **Nunca versionear `.env.local`**
2. **Usar `.env.example` como referencia**
3. **Revisar `.gitignore`** para asegurar que `.env*` está excluido

### Pre-commit Hooks

Configurar hooks para prevenir commits con secretos:

```bash
bash .husky-setup.sh
```

Esto instalará:
- **pre-commit**: Ejecuta ESLint y Prettier
- **pre-push**: Valida tipos con TypeScript

### Validación de Entrada

Siempre validar entrada en Edge Functions:

```typescript
import { validateObject, ValidationSchema } from "./_shared/validation.ts";

const schema: ValidationSchema = {
  email: { type: "email", required: true },
  name: { type: "string", required: true, maxLength: 100 },
};

const { valid, errors } = validateObject(body, schema);
if (!valid) {
  return new Response(JSON.stringify({ errors }), { status: 400 });
}
```

## 🧪 Testing

### Ejecutar Tests

```bash
pnpm run test
```

### Escribir Tests

```typescript
// src/lib/__tests__/constants.test.ts
import { describe, it, expect } from "vitest";
import { slugify, getPlanLimits } from "@/lib/constants";

describe("constants", () => {
  it("slugify convierte texto a slug", () => {
    expect(slugify("Mi Artista")).toBe("mi-artista");
  });

  it("getPlanLimits retorna límites correctos", () => {
    const limits = getPlanLimits("pro");
    expect(limits.photoLimit).toBe(3);
    expect(limits.videoLimit).toBe(3);
  });
});
```

## 📦 Despliegue

### Build para Producción

```bash
pnpm run build
```

Esto genera la carpeta `dist/` con los archivos optimizados.

### Despliegue en Vercel

1. **Conectar repositorio** en [vercel.com](https://vercel.com)
2. **Configurar variables de entorno** en Vercel Dashboard
3. **Desplegar** automáticamente en cada push a `main`

### Despliegue de Edge Functions

```bash
# Usando Supabase CLI
supabase functions deploy

# O manualmente en Supabase Dashboard → Edge Functions
```

## 🐛 Debugging

### Frontend

1. **DevTools de Chrome**: `F12`
2. **React DevTools**: Extensión de Chrome
3. **Logs**: `console.log()`, `console.error()`

### Backend (Edge Functions)

1. **Supabase Dashboard**: Logs en tiempo real
2. **Deno**: Usa `console.log()` para debugging

### Base de Datos

1. **Supabase Dashboard**: SQL Editor para queries
2. **Supabase CLI**: `supabase db push` para cambios locales

## 📚 Recursos Útiles

- [Documentación de React](https://react.dev)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Stripe](https://stripe.com/docs)
- [Documentación de Vite](https://vitejs.dev)
- [Documentación de TailwindCSS](https://tailwindcss.com/docs)

## 🤝 Contribuir

1. **Fork** el repositorio
2. **Crear rama** para tu feature (`git checkout -b feature/amazing-feature`)
3. **Commit** cambios (`git commit -m 'Add amazing feature'`)
4. **Push** a la rama (`git push origin feature/amazing-feature`)
5. **Abrir Pull Request**

## 📞 Soporte

Para preguntas o problemas:

- Crear un **Issue** en GitHub
- Contactar al equipo de TUESDI

---

**Última actualización**: 2026-06-18
**Versión**: 3.0.2
