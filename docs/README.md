# Documentación operativa de TUESDI

El contexto maestro del proyecto (ADN, stack, normas, estado) vive en
[`../TUESDI.md`](../TUESDI.md). Esta carpeta contiene solo documentación
operativa:

| Documento | Para qué |
|---|---|
| [`OPERACIONES.md`](./OPERACIONES.md) | Configuración de producción, monitorización mínima, rutina de despliegue y revisión mensual |
| [`INCIDENTES.md`](./INCIDENTES.md) | Qué hacer cuando algo se rompe (severidades + playbooks) e historial de incidentes |
| [`DNS.md`](./DNS.md) | Estado del dominio/correo y por qué **no** migrar los NS a Vercel |
| [`TUESDI_planes_y_videos.md`](./TUESDI_planes_y_videos.md) | Especificación de planes, límites de media y política de vídeo |

**Regla de esta carpeta:** nada de métricas inventadas, procedimientos para
infraestructura que no existe, ni runbooks de funcionalidades sin activar.
Si un dato no sale de un dashboard o del código, no entra aquí.

*Última actualización: 9 de julio de 2026.*
