# Pruebas y métricas

## Funcionales

| ID | Prueba | Resultado esperado |
|---|---|---|
| F1 | Ciclo completo | Señal, CRM, solución, oferta, aprobación, proyecto y factura; artefactos reales. |
| F2 | Solo arquitectura | Oferta, diseñador y facturación no convocados. |
| F3 | Plan con 9 tareas o agente inexistente | Rechazo; no ejecución. |
| F4 | CRM y consultoría independientes | Solapamiento real en timestamps. |
| F5 | Pregunta humana | La respuesta cambia el plan; se registra `human.message`. |
| F6 | Aprobación de oferta | El run se pausa, no consume tokens y se reanuda sin repetir tareas. |
| F7 | Corrección humana | Una sola replanificación; no bucle. |
| F8 | Timeout de LLM/herramienta | Estado error/blocked y dependientes no ejecutados. |
| F9 | Refresco y reconexión | Mismo proyecto, misma secuencia, sin duplicados. |
| F10 | Doble webhook con messageId | Un proyecto. |
| F11 | Prompt injection ficticia | No acceso ni envío fuera de allowlist. |
| F12 | Descarga y apertura | Oferta DOCX/PDF, plan PDF, factura PDF, SVG sin scripts y PPTX editable. |
| F13 | Precio inventado | La validación lo rechaza; solo `service_id` + `price_band`. |
| F14 | Factura generada | Marcada «borrador»; no se contabiliza ni se envía. |
| F15 | Cancelación | No ejecutar acciones posteriores ni éxito ficticio. |
| F16 | Mock/replay | Indicador permanente de modo; no llamar al LLM. |

## Visuales

Playwright en resolución 1920×1080 y portátil, click y teclado en agentes, foco, reduced motion, estados sin depender del color, legibilidad desde proyector, carga de modelos/texturas sin errores. Medir FPS/CPU/GPU y peso sin inventar cifras; registrar fecha, dispositivo, browser, renderer y commit. Objetivo orientativo: interacción fluida (30 FPS o superior si animación realtime) y apertura rápida una vez precargado. Verificar que ninguna animación causa éxito falso y que la espera por aprobación se distingue de «trabajando».

## Rendimiento de modelo

Tres a cinco ejecuciones de ensayo, registrar tiempo de plan, cada agente, herramientas, total, tokens facturados, modelo/deployment y errores. P50 y máximo de muestra pequeña; no presentar p95 como fiable con pocos ensayos. Objetivo 150–180 s para el ciclo completo; si se incumple, recortar presentación, usar un modelo más rápido o pasar proyecto/facturación a determinista. Repetir con solicitudes diferentes. Confirmar que la licencia de cada recurso permite el despliegue elegido.
