# Spike de decisión visual

Misma microescena: un escritorio blanco, silla, dos monitores, un personaje, planta, ventana y pequeño distintivo Integra autorizado. Tres estados: disponible, trabajando, terminado; click en agente abre inspector. Mismo framing, escala, tarea y cámara aproximada. No construir toda la oficina en cada alternativa.

| Prueba | Límite orientativo | Entrega |
|---|---:|---|
| A, sprites profesionales | 90 min | Escena y animación 2D |
| B, GLB profesional | 120 min | Escena R3F y animación |
| C, prerender Blender | 90 min | Fondo, oclusión y sprite |
| Comparación | 30 min | Capturas y métricas |

Tiempo de ensayo ~5,5 horas-persona; no estimación medida. Puede variar según descarga y rigging. Cortar prueba si no se consigue una pose sentada válida en el tiempo asignado. No adquirir un pack de pago para rescatar el spike.

Criterios (puntuar 1–5 con evidencia): calidad gráfica 35%; facilidad 30%; flexibilidad 10%; rendimiento 10%; impacto demo 15%. Licencia web compatible es requisito excluyente. Medir tiempo real, peso assets, FPS en portátil objetivo, latencia de primer render y legibilidad. Confirmar que el renderer puede representar exactamente los mismos eventos sin duplicar lógica. Elegir un solo renderer para producción.

Hipótesis actual: B o C pueden lograr mayor acabado con modelos profesionales; A preserva Habbo de forma más fiel. El resultado de la prueba manda. El SVG adjunto es una referencia de UX, no candidato final a ganar por estética.

## Resultado del spike (26/11/2026)

- **Ganador elegido:** **Candidato B — 3D ortográfico con React Three Fiber + Drei** (`spikes/renderer-ab/`).
- **Evidencia comprobada:** microescena de 1 escritorio en `A vs B` compartiendo exactamente el mismo reducer (`deskReducer.ts`) y el fixture de 34 eventos; el 3D aportó mayor impacto visual en proyección, pantallas dinámicas por `CanvasTexture`, comentarios operativos anclados en 3D (`<Html>`) y desplazamiento por waypoints (levantarse, caminar a la pizarra DAG y volver a sentarse) sin físicas pesadas.
- **Acción siguiente:** no implementar Candidato A ni C para la oficina completa; decidir en equipo si se enriquece el 3D con packs GLB gratuitos CC0 (Kenney/MrEliptik/Quaternius) o se consolida el estilo 3D estilizado propio.
