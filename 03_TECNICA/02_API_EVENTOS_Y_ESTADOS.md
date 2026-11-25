# Contrato de API y eventos

| Ruta | Responsabilidad |
|---|---|
| POST /api/projects | Crear proyecto, validar input/idempotencia, devolver 202 + id. |
| GET /api/projects/:id | Snapshot de plan, tareas, agentes, estado y entregables. |
| GET /api/projects/:id/events?after=0 | Eventos en orden, cursor último, paginación. |
| GET /api/projects/:id/artifacts/:artifactId | Descargar archivo tras autorización. |
| POST /api/projects/:id/human | Responder a una pregunta o aprobar/corregir; valida el estado y reanuda. |
| POST /api/projects/:id/cancel | Cancelación cooperativa, no éxito ficticio. |
| POST /api/inbox | Opcional: webhook autenticado, deduplicación por messageId. |
| GET /healthz | Salud del proceso, no expone credenciales. |

Evento mínimo: `event_id`, `sequence`, `timestamp`, `type`, `project_id`, `agent_id`/`task_id` cuando proceda, `payload`. La secuencia es monotónica por proyecto, idempotente. Al recibir duplicado ignorar; si hay hueco recuperar snapshot/eventos. Usar esquema `07_CONTRATOS/event.schema.json`. El fixture contiene tiempos sintéticos para UI y no tiene datos privados.

Tipos: request.received; plan.created; task.assigned; task.started; tool.started; tool.completed; artifact.created; task.completed; task.failed; task.blocked; human.message; approval.required; approval.resolved; run.paused; run.resumed; project.completed; project.failed; project.cancelled. Un evento de artifact se emite solo después de escribir archivo con éxito. Estados agente: idle, planning, working, collaborating, waiting, completed, blocked, error. Estados tarea: queued, running, waiting, completed, failed, blocked, cancelled. Estado proyecto terminal: completed, failed, cancelled o interrupted; `paused` es no terminal y espera respuesta humana. El estado del agente se deriva de sus tareas activas, no del último evento de otro agente. Si hay más de una tarea por agente, priorizar running, luego waiting y luego blocked/error según semántica del proyecto.

Seguridad: autenticar API y descarga, límite tamaño, IDs generados por servidor, no aceptar rutas de archivos del modelo. Validar formatos/MIME, escapar XML/SVG, sanitizar nombres, no insertar HTML sin sanitizar. Revisar acceso a proyecto. Registrar eventos operativos sin credenciales o datos innecesarios. `POST /api/inbox` con token de servicio rotado, o autenticación corporativa. El cliente no almacena secretos.
