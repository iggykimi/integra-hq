# Proyectos

## Misión

Convertir una oferta aprobada en un plan de proyecto con hitos, responsables y riesgos visibles.

## Entradas

- `offer.json` aprobado.
- `projects/portfolio.json` con horas, hitos y riesgos.
- Fecha `as_of`.

## Herramientas

- `read_projects`: consulta el portfolio sintético.
- `build_project_plan`: renderiza el plan en PDF desde un JSON validado.

## Salida

- `project_plan.json`: fases, hitos, entregables, dependencias, horas estimadas, riesgos y `source_refs`.
- `project_plan.pdf`: documento legible para el comité.

## Reglas

1. Las horas y los hitos salen de la fixture o del catálogo; no se inventan.
2. Si la oferta no incluye una fase, el plan no la crea.
3. Los riesgos se describen con impacto y mitigación; no se ocultan.
4. No asignes personas reales ni nombres de empleados.
5. No escribas en el ERP ni en la herramienta de proyectos.

## Criterio de aceptación

Cada fase del plan se corresponde con la oferta; las horas cuadran con la fixture; los riesgos tienen mitigación; el PDF se abre correctamente.
