# TUESDI v3.0 — Guía de Accesibilidad (A11y)

**Versión**: 3.0.4  
**Estándar**: WCAG 2.1 AA

## 1. Principios de Accesibilidad

TUESDI sigue los cuatro principios POUR:

- **Perceptible**: La información es presentada de forma que todos pueden percibirla.
- **Operable**: Los usuarios pueden navegar y usar la interfaz con cualquier dispositivo.
- **Comprensible**: El contenido y la navegación son claros y fáciles de entender.
- **Robusto**: El sitio funciona con tecnologías de asistencia (lectores de pantalla, etc.).

## 2. Checklist de Accesibilidad

### Semántica HTML
- [ ] Usar etiquetas semánticas: `<nav>`, `<main>`, `<header>`, `<footer>`, `<article>`, `<section>`
- [ ] Usar `<button>` para acciones, no `<div>` con `onClick`
- [ ] Usar `<a>` para navegación, no `<button>` con `onClick`
- [ ] Usar `<form>` y `<input>` correctamente
- [ ] Usar `<label>` asociado a `<input>` con `htmlFor`

### Atributos ARIA
- [ ] `aria-label` para botones que solo tienen iconos
- [ ] `aria-labelledby` para títulos de secciones
- [ ] `aria-describedby` para descripciones adicionales
- [ ] `aria-live` para anuncios dinámicos
- [ ] `aria-hidden="true"` para iconos decorativos
- [ ] `role` cuando la semántica HTML no es suficiente

### Contraste y Color
- [ ] Contraste mínimo WCAG AA: 4.5:1 para texto, 3:1 para elementos grandes
- [ ] No confiar solo en color para transmitir información
- [ ] Usar patrones, iconos o texto adicional

### Navegación por Teclado
- [ ] Todos los elementos interactivos deben ser accesibles con Tab
- [ ] Orden de tabulación lógico (usar `tabindex` solo si es necesario)
- [ ] Estados `:focus-visible` claros y visibles
- [ ] Soporte para teclas de atajo (Escape para cerrar modales, Enter para enviar)

### Imágenes
- [ ] `alt` descriptivo para imágenes informativas
- [ ] `alt=""` para imágenes decorativas
- [ ] Evitar "imagen de" o "foto de" en el alt
- [ ] Usar `<figure>` y `<figcaption>` para imágenes con contexto

### Formularios
- [ ] `<label>` asociado a cada `<input>`
- [ ] Validación clara con mensajes descriptivos
- [ ] Indicar campos requeridos
- [ ] Agrupar campos relacionados con `<fieldset>` y `<legend>`

### Modales y Diálogos
- [ ] Focus trap: el foco no debe escapar del modal
- [ ] Restaurar foco al cerrar
- [ ] Tecla Escape cierra el modal
- [ ] `role="dialog"` o usar `<dialog>`

### Animaciones
- [ ] Respetar `prefers-reduced-motion`
- [ ] No usar animaciones que parpadeen (> 3 veces por segundo)

## 3. Herramientas de Prueba

### Navegadores
- **Chrome DevTools**: Auditoría de accesibilidad (Lighthouse)
- **Firefox Accessibility Inspector**: Árbol de accesibilidad

### Extensiones
- **axe DevTools**: Detecta problemas de accesibilidad
- **WAVE**: Evaluación visual de accesibilidad
- **Lighthouse**: Auditoría integrada en Chrome

### Lectores de Pantalla
- **NVDA** (Windows, gratuito)
- **JAWS** (Windows, pago)
- **VoiceOver** (macOS, iOS, integrado)
- **TalkBack** (Android, integrado)

## 4. Componentes Accesibles en TUESDI

### Skeleton (Carga)
```tsx
// ✅ Bien: Comunica que está cargando
<Skeleton className="aria-busy='true'" />

// ❌ Mal: Sin indicación de carga
<div className="bg-gray-200 h-4 w-full" />
```

### EmptyState
```tsx
// ✅ Bien: Título claro y acción
<EmptyState
  title="No tienes contactos"
  action={{ label: "Compartir perfil", onClick: () => {} }}
/>

// ❌ Mal: Sin contexto
<div>Sin datos</div>
```

### StatusMessage
```tsx
// ✅ Bien: Anuncio automático
<StatusMessage type="success" title="Guardado" />

// ❌ Mal: Toast efímero sin ARIA
<Toast message="Guardado" />
```

### Botones
```tsx
// ✅ Bien: Texto descriptivo
<button aria-label="Cerrar menú">
  <span aria-hidden="true">✕</span>
</button>

// ❌ Mal: Solo icono sin etiqueta
<button>
  <Icon name="close" />
</button>
```

### Formularios
```tsx
// ✅ Bien: Label asociado
<label htmlFor="email">Email</label>
<input id="email" type="email" required />

// ❌ Mal: Sin label
<input type="email" placeholder="Email" />
```

## 5. Pruebas de Accesibilidad

### Manual
1. Navegar solo con Tab y Shift+Tab
2. Usar un lector de pantalla (NVDA/VoiceOver)
3. Verificar contraste con herramienta de contraste
4. Probar en navegadores antiguos

### Automática
```bash
# Auditoría de Lighthouse
pnpm run build
pnpm run preview
# Abrir Chrome DevTools → Lighthouse → Accessibility

# Usando axe
npm install --save-dev @axe-core/react
```

## 6. Mejoras Futuras

- [ ] Soporte para modo de alto contraste
- [ ] Validación de accesibilidad en CI/CD
- [ ] Pruebas automatizadas con axe
- [ ] Documentación de atajos de teclado

---

**Última actualización**: 2026-06-18
**Versión**: 3.0.4
