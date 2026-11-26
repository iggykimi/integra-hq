# Contratos y fixtures sintéticos

Esquemas JSON Schema Draft 2020-12 de aplicación (revisión 26/11/2026). Adaptar al subconjunto de Structured Outputs admitido por el proveedor; el backend siempre valida de forma independiente. JSON Schema por sí solo no detecta ciclos, IDs duplicados, referencias rotas ni límites de concurrencia: complementar siempre con validación semántica (ver `scripts/validate-dossier.mjs`).

## Esquemas

| Archivo | Productor | Propósito |
|---|---|---|
| `plan.schema.json` | `director` | Plan DAG dinámico (máx. 8 tareas, `requiresApproval`) |
| `event.schema.json` | backend | Flujo monotónico de eventos (`human.message`, `approval.*`, `run.paused/resumed`) |
| `account_brief.schema.json` | `crm` | Brief comercial de cuenta y oportunidades |
| `briefing.schema.json` | `consultant` | Requisitos, supuestos, riesgos y fases |
| `architecture.schema.json` | `architect` | Nodos y conexiones para render SVG sanitizado |
| `offer.schema.json` | `offers` | Oferta comercial en estado `BORRADOR` con bandas de catálogo |
| `project_plan.schema.json` | `delivery` | Plan de proyecto determinista con fases, hitos, horas y riesgos |
| `billing_report.schema.json` | `billing` | Aging y borrador de factura (`BORRADOR · NO CONTABILIZADO`, `posted: false`) |
| `presentation.schema.json` | `designer` | Estructura de 6 diapositivas para PptxGenJS |
| `types.ts` | compartido | Tipos TypeScript de referencia (no SDK compilado) |

## Fixtures sintéticos (`synthetic: true`, `as_of: 2026-11-26`)

- `fixtures/request.json`: petición de ciclo completo para **Nortia Industrial**.
- `fixtures/plan.json`: plan completo de 7 tareas con `requiresApproval: true` en `offers`.
- `fixtures/plan.architecture-only.json`: segundo flujo demostrable (solo `consultant` + `architect` para Microsoft Fabric).
- `fixtures/events.mock.json`: traza sintética completa de 34 eventos (8 agentes, pregunta humana, pausa/reanudación por aprobación y cierre terminal).
- `fixtures/data/crm/accounts.json`: cuenta ficticia `ACC-NORTIA-001`, oportunidades y actividades.
- `fixtures/data/catalog/services.json`: catálogo sintético con bandas de precio marcadas «pendiente de validación comercial».
- `fixtures/data/projects/portfolio.json`: histórico, plantillas de fases, hitos y riesgos estándar.
- `fixtures/data/billing/invoices.json`: contrato sintético e histórico de facturas para cálculo determinista de aging.

Ningún fixture contiene datos reales, credenciales ni documentos finales ya generados.
