# Despliegue, coste y gobernanza

## Local (sin servicios cloud obligatorios)

Node LTS compatible con dependencias, npm lockfile, `.env` local ignorado, mock provider y replay. El dossier no trae node_modules ni una app completa. El replay HTML incluido sí funciona directamente. Si se configura un proveedor real, cuenta y cuotas propias; consumo no garantizado gratuito.

## Azure (objetivo, pendiente de permisos)

Container Apps con frontend compilado servido por API, HTTPS, una réplica activa durante la demo, autenticación (Entra o acceso interno autorizado), Blob Storage para artefactos y snapshots, Azure OpenAI/Foundry para modelos. Managed Identity y RBAC de mínimo privilegio donde sea viable; secretos en configuración segura/Key Vault si disponible. Evitar API pública sin autenticación. No abrir storage al público por comodidad. Retención corta de datos ficticios, limpieza de recursos y límites presupuestarios. No crear recursos sin permiso. [Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/), [Azure pricing](https://azure.microsoft.com/pricing/).

Los servicios pueden generar costes incluso con réplicas bajas; no prometer free tier ni un importe fijo. No se conocen suscripción, créditos, despliegue ni licencias M365 del equipo. Configurar entorno real solo después de comprobarlos. La alternativa local no demuestra cloud, pero mantiene demo funcional.

## Outlook opcional

Power Automate, trigger «When a new email arrives (V3)» en buzón de pruebas, POST autenticado a /api/inbox; guardar messageId para idempotencia. Microsoft documenta retrasos raros de hasta una hora: no depender de llegada en directo. Preparar correo antes y activar proyecto desde UI o entrada manual. La acción HTTP y otras funciones pueden requerir licencia adicional. Si se usa Graph, confirmar permisos, suscripción, validación webhook, renovación y recuperación del mensaje. No enviar ni leer buzones ajenos sin permiso. [Conector oficial](https://learn.microsoft.com/en-us/connectors/office365connector/), [Graph notificaciones Outlook](https://learn.microsoft.com/en-us/graph/outlook-change-notifications-overview).

## Riesgos y mitigación

| Riesgo | Medida |
|---|---|
| Prompt injection en correo o documentos | Tratar contenido externo como datos no confiables, no instrucciones privilegiadas. Herramientas allowlist y validación backend. |
| Datos reales o secretos | Cliente y documentos sintéticos, acceso mínimo; logs sin contenido sensible. |
| Modelo alucina | Referencias explícitas, validación de schema, marcar hipótesis, no inventar tarifas ni SLA. |
| Bucle o gasto | Límites de tareas, concurrencia, iteraciones, timeout, presupuesto. |
| Fallo de herramienta | Estado blocked/error; retry controlado; preservar evidencia. |
| Duplicados | Idempotencia y secuencia por proyecto. |
| Acceso externo | Auth y autorización por proyecto; ficheros no públicos. |
| Reinicio | Snapshot y estado interrupted; replay solo de registro real persistido. |
| Assets/licencias | Registro ASSETS y fuentes. No redistribuir originales prohibidos. |

Para medir: latencia p50/p95 de cada etapa, errores, tokens si API los ofrece, tamaño de archivo, costes según tarifas reales; sin métricas inventadas. Guardar traces operativas, no razonamiento privado.
