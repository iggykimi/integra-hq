# Herramientas de agentes

| Tool | Entrada | Salida y guardas |
|---|---|---|
| search_knowledge | query, categories | Lista de fragmentos con source_id y URL. Búsqueda local, no scraping en directo obligatorio. |
| generate_architecture | nodos, edges, labels | SVG sanitizado y JSON de arquitectura. Limitar nodos, IDs, conexiones, texto. |
| generate_presentation | JSON de slides | PPTX válido con plantilla local; validar 5–6 slides, límites de texto y fuentes. |
| save_artifact | tipo, contenido validado, metadata | id, nombre, MIME, tamaño, checksum y URL autorizada. Nunca aceptar una ruta arbitraria. |

Director invoca planificación; especialistas reciben contexto seleccionado, no acceso a todo. El backend puede recuperar conocimiento de forma determinista antes de la llamada en lugar de obligar a tool-calling extra. El agente produce especificación, la herramienta materializa el archivo. El diseñador no necesita generar ni ejecutar JavaScript. Un diagrama de arquitectura se compone de nodos/edges con IDs, render por layout determinista. No incrustar SVG externo sin sanitizar. Para PPTX, utilizar 16:9, 5–6 layouts, tamaño texto suficiente, maestros corporativos autorizados y logos SVG válidos. Si no hay permiso de marca, usar plantilla original neutra.

Slides: portada; contexto/requisitos; propuesta tecnológica; arquitectura; plan por fases; riesgos y próximos pasos. El briefing y el diagrama son resultados reales del flujo. No inventar precios ni cifras de cliente; etiquetar supuestos y dependencias. Si se requiere una estimación, dejar rango justificado como propuesta, nunca tarifa oficial.

Referencia: [PptxGenJS](https://github.com/gitbrent/PptxGenJS). Genera archivos OOXML sin PowerPoint instalado. Verificar apertura en PowerPoint/LibreOffice. No confundir el JSON de fixture con una presentación generada de verdad.
