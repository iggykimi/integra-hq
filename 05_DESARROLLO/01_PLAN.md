# Plan de implementación y reparto

> Revisión 25/11/2026. La estimación histórica de 26–40 horas-persona queda como **referencia**, no como compromiso: el alcance actual incluye 8 agentes, pausa por aprobación humana, documentos DOCX/PDF y un ciclo completo. Reestimar antes de cerrar fechas.

| Orden | Ticket | Criterio de aceptación |
|---|---|---|
| 1 | Contratos de plan, eventos y aprobación | 8 agentes, `requiresApproval`, `human.message`, `run.paused/resumed`; DAG inválido rechazado. |
| 2 | Spike A/B/C de escritorio | Elegir renderer con evidencia, licencia y rendimiento; no decidir por una captura aislada. |
| 3 | Flujo vertical mock → live | Señal de oportunidad → plan → pregunta humana → solución → oferta → aprobación → proyecto → factura. |
| 4 | Herramientas y documentos | Oferta DOCX/PDF, plan de proyecto PDF, factura PDF, SVG y PPTX descargables y abribles. |
| 5 | UI oficina | 5 zonas, 8 roles, panel de pregunta/aprobación, inspector y estados de espera. |
| 6 | Persistencia y reanudación | Refresh y reconexión no pierden el proyecto; la pausa por aprobación se reanuda sin repetir tareas. |
| 7 | Azure | Resource group de Integra, health, una ejecución desde URL de demo; local como contingencia. |
| 8 | Ensayo | 180 s, pregunta humana real, segunda petición y replay de una ejecución real. |
| 9 | Extras | Outlook, intro, easter egg y panel de costes solo si P0 pasa. |

Equipo de cuatro como hipótesis: (A) dirección artística/assets; (B) renderer/UI; (C) director/LLM y estado; (D) documentos, pruebas e infraestructura. Definir contratos y esquemas de salida al empezar. Integrar a diario o en bloques cortos. No construir un backend por renderer. Recortar extras antes de añadir agentes o conectores.

## Orden de recorte si el tiempo aprieta

1. La presentación PPTX puede pasar a un resumen visual; la oferta DOCX/PDF no.
2. La factura puede ser un PDF determinista sin llamada al modelo.
3. La segunda petición puede ser un plan mostrado sin ejecución completa.
4. El intro y los extras se caen primero.
5. No se recorta: aprobación humana, trazabilidad, oferta real y estados de error.

## Definition of done

Cada ticket tiene pruebas reproducibles, documentación, licencias, ruta de error, sin credenciales ni datos reales. El modo live llama al modelo y genera documentos; mock y replay están etiquetados. No cerrar si los archivos solo se simulan, si el plan está hardcodeado para todas las solicitudes o si la aprobación humana no cambia el resultado.
