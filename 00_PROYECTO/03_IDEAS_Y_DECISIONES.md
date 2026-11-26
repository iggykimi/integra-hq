# Ideas exploradas y decisiones de alcance

| Idea | Estado | Razón |
|---|---|---|
| Futuro edificio DAT Alierta | Identidad conceptual | Reconocimiento y narrativa, no recreación oficial. |
| Tres plantas: dirección, tecnología, negocio | Backlog | No aporta valor suficiente a la demo actual. |
| Oficina pixel art Habbo | Candidato A | Estilo reconocible, requiere sprites compatibles. |
| Diorama 3D low-poly profesional | Candidato B | Importar GLB, no hacer todo con cubos. |
| HD-2D, Blender prerenderizado | Candidato C | Cámara fija, sombras y animaciones exportadas. |
| SVG/CSS y Canvas procedural | Contingencia/experimento | Buen control, riesgo de arte genérico. |
| Imagen generada + overlays | Contingencia | Rápido, oclusiones y modificación difíciles. |
| Voxel | Descartado de momento | Identidad demasiado cercana a mundos de bloques. |
| Correo entrante real | P1 | Valor alto, latencia y permisos inciertos. |
| Casos transversales CRM + datos + formación | P0 | Decisión 25/11/2026: la demo cuenta el ciclo completo; CRM, proyectos y facturación entran. |
| Aprobación humana | P0 | Pausa, reanudación y una corrección controlada. |
| Oferta, plan y factura en DOCX/PDF | P0 | Documentos reales; el JSON es interno. |
| Azure OpenAI `gpt-6-luna` | P0 (confirmado) | Deployment disponible en la suscripción de Integra; adaptador de proveedor para escalar a Sol si hace falta. |
| Reunión de dirección a partir de Excel | Backlog | Analítica real, requiere dataset y herramientas adicionales. |
| Contratación de un agente desde UI | Backlog | Buena metáfora, no necesaria para probar extensibilidad. |
| Replay/inspector | P1 / P0 inspector | Evidencia y resiliencia. |
| Pizarra, monitores, sobre, documento | P0 visual | Explican causalidad; vincular a eventos. |
| Cafetería / PC de 1986 | P1 | Un detalle identitario, no un minijuego. |
| Ciudad, lluvia, noche, ascensor, azotea | Backlog | Ambientación no esencial. |
| Voz, vídeo largo, música, NPCs | Fuera | Coste, distracción, licencias. |
| RAG Azure AI Search, PostgreSQL, Service Bus | Evolución | Solo cuando el volumen y persistencia lo justifiquen. |

## Decisiones de alcance (ADR)

1. Renderer: comparar A/B/C con el mismo escritorio. No decidir por una captura aislada.
2. Assets: logo oficial y kit de marca; permiso para el hackathon. Resto sin compra, empezar CC0 y registrar licencia.
3. Modelo: confirmado **Azure OpenAI con `gpt-6-luna`** en la suscripción de Integra como base de arranque para todos los roles LLM (baja latencia y coste); mantener adaptador de proveedor para poder subir director/arquitecto a `gpt-6.1-sol` o `gpt-6.2-sol` sin tocar prompts.
4. Hosting: resource group de Integra en Azure si hay permiso; local como contingencia.
5. Branding: kit oficial en `08_RECURSOS/brand/`; no redibujar el logo ni presentar el proyecto como producto oficial.
6. Permisos de Outlook y uso de documentación interna: P1; solicitar autorización. La entrada web funciona sin ellos.
7. Alcance: ciclo completo de 8 agentes con aprobación humana. No volver al MVP de 4 agentes.
