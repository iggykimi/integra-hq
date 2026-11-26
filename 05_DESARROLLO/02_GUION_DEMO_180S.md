# Guion de demo · 180 segundos

> Historia: **Nortia Industrial**. Señal de oportunidad → oferta → aprobación humana → proyecto → borrador de factura. El guion anterior (reunión industrial aislada) queda como segunda petición, no como demo principal.

| Tiempo | Qué se muestra | Mensaje |
|---|---|---|
| 0:00–0:15 | Intro y oficina; 5 zonas, 8 roles | «Una dirección, un equipo de especialistas digitales.» |
| 0:15–0:35 | Señal de oportunidad en CRM; petición en la UI | «No empieza en un chat: empieza en una señal de negocio.» |
| 0:35–0:50 | El director pregunta: «¿Incluimos formación?»; la persona responde | «La persona no solo aprueba: decide el alcance antes de planificar.» |
| 0:50–1:10 | Plan JSON validado; CRM y Consultoría en paralelo | «El director decide quién interviene y qué depende de qué.» |
| 1:10–1:25 | Arquitectura (SVG) y oferta (DOCX/PDF); la oficina muestra espera y trabajo | «Los especialistas usan datos y reglas, no solo prompt.» |
| 1:25–1:40 | Oferta DOCX/PDF; aprobación humana; la ejecución se pausa | «Nada sale al cliente sin una persona.» |
| 1:40–2:10 | Reanudación; Proyecto y borrador de factura en paralelo | «La empresa agéntica no termina en la propuesta: sigue el ciclo.» |
| 2:10–2:30 | Presentación PPTX y documentos abiertos | «Los resultados son reales, editables y trazables.» |
| 2:30–3:00 | Inspector, eventos y cierre | «La oficina no es una película: es el estado del trabajo.» |

## Qué tiene que pasar de verdad

1. La señal de CRM sale de una fixture con fecha y fuente.
2. La pregunta del director cambia el plan: si la persona dice «con formación», se añade una fase a la oferta; si dice «sin formación», no.
3. La aprobación pausa la ejecución y la reanuda; no es un botón que solo cambia el color.
4. La oferta, el plan de proyecto y la factura son documentos abribles; el JSON no se enseña como entregable.
5. La factura es un **borrador**; no se contabiliza ni se envía.
6. Cada estado de la oficina tiene un evento detrás.

## Si algo falla

- Si el modelo o la red fallan, cambiar a **replay de una ejecución real** y decirlo: «esto es una reproducción de una ejecución anterior».
- Si el tiempo se pasa, cerrar la fase de proyecto/factura con el resumen determinista ya calculado; no esperar en silencio.
- Si la aprobación no llega, mostrar el estado «esperando aprobación»; no simular un éxito.
- No mostrar claves, logs sensibles ni datos de clientes reales.

## Checklist

- Abrir navegador a 1080p, sin notificaciones privadas.
- Verificar deployment de GPT-6.1 / Luna, cuota y latencia.
- Ensayar la pregunta humana y la aprobación varias veces.
- Tener descargados los documentos de la última ejecución real.
- Tener el replay etiquetado y el fallback local.
- Cronometrar: 180 s de reloj, no de presentador.

Cierre: «Una empresa agéntica no sustituye al equipo: convierte sus capacidades en un equipo digital coordinado, visible y supervisable.»
