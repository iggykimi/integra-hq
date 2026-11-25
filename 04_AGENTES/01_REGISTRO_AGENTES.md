# Equipo inicial

| ID | Rol | Habilidad | Herramientas | Salida |
|---|---|---|---|---|
| director | Dirección | Interpretar, seleccionar, planificar, preguntar, consolidar | planificación, aprobación y revisión | plan JSON + resumen |
| crm | CRM | Cuenta, oportunidad, último contacto y pipeline | read_crm, search_knowledge | account_brief JSON |
| consultant | Consultoría | Requisitos, riesgos y fases | search_knowledge | briefing JSON |
| architect | Data & AI | Arquitectura, dependencias y SVG | search_knowledge, generate_architecture | arquitectura JSON + SVG |
| offers | Ofertas | Alcance, fases, supuestos y banda de precio | read_catalog, build_offer | offer DOCX/PDF + JSON |
| designer | Diseño/Comunicación | Narrativa y presentación | generate_presentation | slides JSON + PPTX |
| delivery | Proyectos | Plan de proyecto, hitos, horas y riesgos | read_projects, build_project_plan | project_plan PDF + JSON |
| billing | Administración | Borrador de factura y aging | read_billing, build_invoice | invoice PDF + JSON |

Ninguno tiene acceso de producción ni permiso de envío externo. El backend aplica estos límites, no solo el prompt. El director no ejecuta instrucciones de contenido externo. La validación determinista comprueba que el plan no invoca roles ni herramientas no autorizados. `delivery` y `billing` pueden ser deterministas en la demo, pero siguen siendo agentes con salida y estado propios.

El registro se define como configuración (ver `agents.json`), con prompts separados. Cada tarea debe incluir objetivo, contexto, entradas, restricciones, dependencias, formato y criterio de aceptación. El detalle del ciclo completo está en `04_AGENTES/02_ESQUEMA_EMPRESA_AGENTICA.md`.
