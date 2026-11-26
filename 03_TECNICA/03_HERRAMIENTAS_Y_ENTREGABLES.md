# Herramientas de agentes y generación de entregables

> Revisión 26/11/2026. Todas las herramientas están tipadas en TypeScript, bajo allowlist por agente y con validación determinista en backend. Ninguna ejecuta código producido por el LLM ni realiza envíos externos.

## Catálogo de herramientas (P0)

| Tool | Agente(s) | Entrada | Salida y guardas |
|---|---|---|---|
| `ask_human` | `director` | pregunta, opciones, `task_id` | Emite `human.message` y pausa hasta respuesta; modifica el plan sin bucles abiertos. |
| `request_approval` | `director` | `task_id`, `artifact_id`, resumen | Emite `approval.required` + `run.paused`; detiene consumo de tokens hasta `POST /api/projects/:id/human`. |
| `read_crm` | `crm` | `account_id`, `as_of` | Lee fixture `crm/accounts.json`, calcula `last_contact_days` y `stale` en código; solo lectura y restringido a la cuenta solicitada. |
| `search_knowledge` | `crm`, `consultant`, `architect` | `query`, `categories` | Fragmentos de `04_AGENTES/knowledge/*.md` con `source_id` y URL. Local, sin scraping en directo. |
| `generate_architecture` | `architect` | `architecture.json` (nodos, edges) | Valida contra `architecture.schema.json` (máx. 10 nodos, 15 enlaces), aplica layout determinista y escapa XML/SVG; sin scripts embebidos. |
| `read_catalog` | `offers` | `service_ids` o categorías | Lee `catalog/services.json` con bandas aprobadas; impide tarifas libres o inventadas. |
| `build_offer` | `offers` | `offer.json` validado | Verifica `service_id` + `price_band` contra catálogo y genera `offer.docx` + `offer.pdf` con marca «BORRADOR» y kit de marca autorizado. |
| `read_projects` | `delivery` | `account_id`, `as_of` | Lee `projects/portfolio.json` (hitos, horas, riesgos); solo lectura. |
| `build_project_plan` | `delivery` | `project_plan.json` validado | Genera `project_plan.pdf` determinista con fases alineadas a la oferta aprobada; no asigna empleados reales. |
| `read_billing` | `billing` | `account_id`, `as_of` | Lee `billing/invoices.json` y calcula aging y discrepancias en código. |
| `build_invoice` | `billing` | `billing_report.json` validado | Genera `invoice.pdf` determinista marcado «BORRADOR · NO CONTABILIZADO»; bloquea emisión si hay discrepancia de contrato/hito. |
| `generate_presentation` | `designer` | `slides.json` validado | Genera PPTX 16:9 (máx. 6 diapositivas) con PptxGenJS y maestro local; sin ejecutar JS del modelo. |
| `save_artifact` | backend | tipo, contenido validado, metadata | Persiste archivo con ID generado por servidor, MIME, tamaño, SHA-256 y ruta autorizada; emite `artifact.created` solo tras escritura confirmada. |

## Principios de ejecución y documentos

- **Contexto mínimo:** el director invoca planificación; cada especialista recibe solo las entradas y salidas de sus dependencias. El backend puede inyectar conocimiento determinista antes de la llamada LLM para evitar round-trips innecesarios.
- **Separación especificación → archivo:** el agente devuelve JSON validado contra `07_CONTRATOS/*.schema.json`; la herramienta materializa el documento desde plantillas locales.
- **DOCX y PDF sin dependencias pesadas:** en lugar de depender de LibreOffice en contenedor para convertir DOCX → PDF, generar `offer.docx` (p. ej. librería `docx` en Node) y `offer.pdf` (`pdfmake`/`pdf-lib` o render HTML→PDF controlado) en paralelo desde el mismo `offer.json` validado. Esto reduce latencia, tamaño de imagen Docker y fallos de formato en Azure.
- **Diagrama SVG:** layout determinista a partir de `nodes`/`edges` con IDs validados y texto escapado. No incrustar SVG externo sin sanitizar.
- **Presentación PPTX:** formato 16:9, 5–6 layouts (`cover`, `context`, `solution`, `architecture`, `roadmap`, `risks`), tamaño de texto legible en proyección, paleta de `08_RECURSOS/brand/` y logo SVG autorizado. Generación sin PowerPoint instalado mediante [PptxGenJS](https://github.com/gitbrent/PptxGenJS); comprobar apertura en PowerPoint y LibreOffice.
- **Sin cifras inventadas:** precios siempre como banda de catálogo marcada «pendiente de validación comercial»; fechas, días sin contacto y aging calculados en código contra `as_of`. No confundir fixtures JSON con entregables finales.
