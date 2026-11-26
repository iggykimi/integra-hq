# Alcance del MVP (contrato de equipo)

> Revisión 25/11/2026. Sustituye el alcance anterior de director + 3 especialistas. La demo cuenta **un ciclo completo de negocio**, no una sucesión de piezas sueltas.

## Historia principal

Cliente ficticio: **Nortia Industrial**. La dirección recibe una señal de oportunidad (ampliación de un proyecto, nuevo contacto, necesidad detectada). El director reparte el trabajo, pide una decisión a una persona, prepara la oferta, la persona la aprueba, y el sistema encadena proyecto y borrador de factura. Todo en **180 segundos**.

```
Señal / oportunidad
  → CRM + Consultoría
  → Arquitectura
  → Oferta
  → Decisión humana
  → Proyecto + Facturación
  → Presentación y cierre
```

## Obligatorio (P0)

| Entrega | Criterio de terminado |
|---|---|
| Ciclo completo | De la señal de oportunidad al borrador de factura, con estados terminales claros. |
| Director + 7 especialistas | `crm`, `consultant`, `architect`, `offers`, `designer`, `delivery`, `billing`; prompts, herramientas y salidas separadas. |
| Plan dinámico | JSON validado con dependencias; al menos dos combinaciones demostrables. |
| Interacción humana | El director hace al menos una pregunta cuya respuesta cambia el plan; después pide aprobación antes de emitir la oferta. |
| Pausa y reanudación | La ejecución se detiene en la aprobación y continúa sin perder estado; los eventos lo reflejan. |
| Oferta real | DOCX/PDF editable, generado desde catálogo y datos de la cuenta; el JSON interno no se muestra como entregable. |
| Proyecto y factura | Plan de proyecto y borrador de factura en PDF, marcados como borrador; sin contabilizar ni enviar. |
| Presentación | PPTX de 6 diapositivas para el comité, generado desde los resultados. |
| Arquitectura | SVG generado desde un JSON validado de nodos y conexiones. |
| Oficina visual | 5 zonas y 8 roles; la actividad se mueve con eventos reales, no con animaciones inventadas. |
| Trazabilidad | Inspector con tareas, herramientas, fuentes, artefactos y decisiones; sin razonamiento privado del modelo. |
| Demo | 180 s ensayados; replay de una ejecución real claramente etiquetado. |
| Despliegue | Local probado; Azure en el resource group de Integra si hay cuota y permisos. |

## Agentes

| Agente | Zona | Qué hace en la demo | P0 |
|---|---|---|---|
| `director` | Dirección | Planifica, pregunta, valida, pausa y consolida | Sí |
| `crm` | Comercial | Detecta la oportunidad, lee cuenta, último contacto y pipeline | Sí |
| `consultant` | Soluciones | Requisitos, riesgos y fases | Sí |
| `architect` | Soluciones | Solución, dependencias y SVG | Sí |
| `offers` | Comercial | Oferta DOCX/PDF con alcance, supuestos y banda de precio | Sí |
| `designer` | Comunicación | Presentación de 6 diapositivas | Sí |
| `delivery` | Operación | Plan de proyecto, hitos y riesgos | Sí, simulado |
| `billing` | Operación | Borrador de factura y aging | Sí, simulado |

`delivery` y `billing` pueden ser deterministas y rápidos; no necesitan una llamada larga al modelo. La oficina los muestra trabajando y el resultado es un documento real.

## Interacción humana

1. El director detecta una decisión que no puede tomar solo: por ejemplo, «¿incluimos la fase de formación en la oferta?».
2. La persona responde en el panel. La respuesta añade o quita una fase del plan.
3. Antes de emitir la oferta, el director pide aprobación. La ejecución se pausa.
4. La persona aprueba o corrige. Si corrige, hay **una** replanificación controlada; no bucles abiertos.
5. La fase de proyecto y factura solo arranca después de la aprobación.

La conversación no es un chat libre: el director propone opciones, la persona decide y todo queda en el registro de eventos.

## Entregables

| Artefacto | Formato | Cuándo |
|---|---|---|
| Brief de oportunidad y cuenta | JSON interno + vista legible | Tras CRM |
| Briefing de requisitos | JSON + resumen | Tras consultoría |
| Arquitectura | SVG + JSON | Tras arquitectura |
| Oferta | DOCX/PDF + JSON interno | Antes de la aprobación |
| Plan de proyecto | DOCX/PDF + JSON interno | Tras la aprobación |
| Borrador de factura | PDF | Tras la aprobación |
| Presentación | PPTX | Al final |

El JSON es la representación validable; el entregable que se abre en la demo es el documento. No mostrar JSON crudo como si fuera la oferta.

## Datos

Fixtures sintéticas y versionadas, con fecha `as_of` fija:

- `crm/accounts.json`: cuenta, oportunidades, actividades y último contacto.
- `catalog/services.json`: servicios aprobados y bandas de precio.
- `projects/portfolio.json`: hitos, horas y riesgos.
- `billing/invoices.json`: facturas, vencimientos y pagos.
- `knowledge/*.md`: fichas públicas y metodología.

No se conectan CRM ni ERP reales en el hackathon. No se envían correos ni se contabilizan facturas.

## Visual

- 5 zonas: Dirección, Comercial, Soluciones, Comunicación y Operación.
- 8 roles; los agentes pueden compartir zona cuando no trabajan a la vez.
- La escena debe leerse en 3 segundos: quién trabaja, en qué y qué está esperando.
- Estados visibles: trabajando, esperando aprobación, bloqueado, completado, error.
- El renderer (2D, 3D o prerender) se decide tras el spike A/B/C; el alcance no depende de esa decisión.

## Modelo y despliegue

- **Base confirmada (26/11/2026):** **Azure OpenAI con `gpt-6-luna`** en la suscripción de Integra (1,1M contexto, baja latencia y coste), válido para arrancar planificación y especialistas sin bloqueos de cuota.
- **Escalado opcional:** `gpt-6.1-sol` / `gpt-6.2-sol` para dirección o arquitectura si en las pruebas de evaluación el director necesitase mayor capacidad de razonamiento.
- **Adaptador de proveedor** desde el primer día; no hardcodear el nombre del deployment en los prompts.
- **Azure:** resource group de Integra, sin crear servicios nuevos hasta comprobar cuota y permisos. Local primero.
- **Repositorio:** público `integra-hq`, con la marca usada para el hackathon y la nota de que no es un producto oficial.

## Deseable (P1)

- Outlook mediante Power Automate o Microsoft Graph.
- Replay persistido y panel de costes.
- Conectores reales de CRM/ERP.
- Más agentes de otras áreas.
- Aprobaciones configurables por tipo de acción.

## Fuera de alcance

Edificio de tres plantas, movilidad libre, editor de oficinas, multijugador, voz, NPCs autónomos, 3D con físicas, agentes configurables desde la UI, memoria larga, RAG masivo, conectores de producción, correo autónomo, microservicios, facturación real, contabilidad, envío de ofertas sin aprobación.

## No confundir los modos

- **Live:** llamadas reales al modelo y herramientas; el plan y las salidas no están preescritos.
- **Replay:** registro de una ejecución real previa; no repite llamadas; etiqueta visible.
- **Mock:** datos sintéticos para desarrollo o pruebas; jamás presentarlo como live o replay.

## Criterio de cierre

La demo está terminada cuando una persona puede ver el ciclo completo, intervenir una vez, aprobar la oferta y abrir los documentos generados, con todos los estados de la oficina justificados por eventos. Si una parte se simula, se etiqueta.
