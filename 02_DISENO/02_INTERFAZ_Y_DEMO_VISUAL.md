# UX y composición

Objetivo: escritorio 1920×1080 y proyección. Oficina ~70–75% y panel lateral ~25–30%. Cabecera compacta: logo, proyecto, modo (LIVE / REPLAY / MOCK), conexión. Barra de comando inferior o superior accesible. No usar un dashboard de cards. El panel lateral alterna resumen de proyecto, inspector de agente, archivos, actividad y fuentes. No cambiar de página para cada detalle.

La cabecera, los documentos y la presentación usan el kit de `08_RECURSOS/brand/` (logo oficial, cian/azul marino, Causten o su sustituta). La oficina mantiene la paleta material de `01_DIRECCION_ARTISTICA.md`; no convertir la escena en una diapositiva corporativa.

Jerarquía: primero objetivo y estado del proyecto; luego estado de cada especialista; por último detalle técnico. Las etiquetas flotantes no ocultan la escena. Inspector muestra rol, tarea, estado, herramientas y fuentes, resumen de actividad, artefactos. No mostrar chain-of-thought ni prompts/credenciales privados. Progreso por tareas completadas del plan, no porcentajes inventados.

## Interacción mínima

- Nuevo encargo manual; cargar ejemplo ficticio; opcional procesar correo ya recibido.
- Click/tap y teclado para seleccionar un agente, panel con foco manejable y cierre Escape.
- Consultar plan y dependencias sin forzar un grafo complejo (lista basta).
- Responder a una pregunta del director y aprobar o corregir la oferta; la respuesta cambia el plan.
- Descargar oferta, plan de proyecto y factura en DOCX/PDF; SVG y PPTX cuando `artifact.created` confirme almacenamiento.
- Ver el estado «esperando aprobación» y reanudar sin perder el run.
- Estado de conexión, error con reintento seguro, cancelación o timeout visible.
- Replay con pausa/avance y etiqueta clara. Mock separado visualmente.
- Opción de reducir movimiento y silenciar efectos (si existen). No depender del audio para la demo.

## Intro opcional 7 segundos

0–2 s: PC retro 1986; 2–4 s: referencias 2026; 4–7 s: futura sede en diorama y transición hacia oficina. Hacerlo con código, sin vídeo de generación obligatorio. No consumir tiempo si el flujo no está listo. Easter egg: ordenador histórico en recepción con mensaje breve sobre los orígenes de Integra.

Ver `06_PROTOTIPO_OFFLINE/index.html`: prueba conceptual de la composición y el contrato de estados, SVG original sin assets externos. No confundir con la dirección artística definitiva; sustituir por el renderer elegido.
