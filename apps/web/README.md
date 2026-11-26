# Integra HQ · Oficina 3D flagship (`apps/web`)

Prototipo visual del hackathon: sede **DAT Alierta 2029** de **28 × 20 m**, 8 especialistas digitales, campus exterior y replay de **34 eventos**. Renderizado con **React Three Fiber + Three.js + Drei** en cámara ortográfica.

> Estado: **prototipo visual con datos ficticios**. La cabecera identifica la demo. No hay backend, SSE ni LLM en vivo conectados. No es un producto oficial de Integra.

## Arrancar

```bash
cd apps/web
npm install
npm run dev
```

Abrir **http://127.0.0.1:5173/**.

```bash
npm run build      # tsc --noEmit && vite build
npm run typecheck  # solo TypeScript
```

## Qué se puede probar

- **Iniciar demo**: abre el caso Nortia desde el principio. La cámara y el foco acompañan las dos decisiones: incluir formación y aprobar la oferta. Al confirmar, vuelve la vista general. Se puede pedir una revisión y volver a la aprobación.
- **Oficina y Campus**: accesos sobre la escena. `Vista` reúne las 12 cámaras, luces de día/atardecer/noche, etiquetas y movimiento. Los FPS y las acciones de ensayo están en `Controles de prueba`.
- **Actividad**: acceso directo a las dos decisiones; `Registro de eventos` abre la secuencia completa y permite moverse por los 34 eventos.
- **Proyecto y Agente**: seguimiento del trabajo y resultados del ejemplo. Los identificadores de herramientas y fuentes están en `Detalles técnicos`.
- **Etiquetas**: las vistas generales reservan avisos para agentes activos. Se puede seleccionar un agente para ver su actividad. Durante las decisiones destacan Elena y los agentes implicados.
- **Reducir movimiento**: desactiva desplazamientos y simulador ambiental; los estados siguen visibles.

## Mapa de la sede

| Zona | Contenido |
|---|---|
| Dirección | Puesto de Elena, pizarra DAG, acceso a Sala Alierta |
| Recepción / atrio | Escalera a doble altura, pared corporativa azul con logo Integra, reloj analógico 3D en hora real, PC 1986 |
| Sala Alierta | Mesa de consejo para 8 plazas y pantalla de checkpoint |
| Academia Integra | Aula reactiva a `includesTraining` (con/sin formación) |
| Grada IntegraTalks | Graderío de roble para charlas y pausas |
| Comercial | CRM, Ofertas, impresora y cabina acústica |
| Soluciones · Data & AI | Pizarra Fabric, puestos y Server Lab acristalado con 3 racks |
| Comunicación | Estudio de presentaciones y pantalla de diapositivas |
| Operación | Proyectos, facturación y bandejas de documentación |
| Rincón Café & Lounge | Barra de espresso, sofá, sillón y terraza conectada |
| Terraza Exterior | Voladizo con pérgola cerámica, mesas y vistas al campus |
| Campus | 4 pabellones tecnológicos, monolito DAT Alierta · INTEGRA, aparcamiento con 4 cargas EV y 3 coches CC0, lámina de agua, carril bici, ciclista, peatones, tráfico y niebla |

Elementos repetidos con `InstancedMesh`: **180 celosías cerámicas** y **112 módulos de jardín vertical**.

## Mapa de código

| Archivo | Responsabilidad |
|---|---|
| `src/App.tsx` | Controles de la demo, actividad, inspector, decisiones y accesibilidad |
| `src/scene/OfficeCanvas.tsx` | Canvas, cámara ortográfica, luces, sombras, bloom, métricas FPS y rig de cámara |
| `src/scene/OfficeArchitecture.tsx` | Sede 28×20 m, atrio, salas, mobiliario, terraza, pérgola, celosías y Server Lab |
| `src/scene/CampusExterior.tsx` | Pabellones, monolito, aparcamiento EV, agua, bici, tráfico, peatones y horizonte |
| `src/scene/WorkstationDesks.tsx` | Puestos por rol y props diferenciados |
| `src/scene/SpecialistAgent.tsx` | 8 agentes, movimiento por waypoints, poses, badges y globos 3D |
| `src/scene/DataFlowPulses.tsx` | Pulsos de handoff entre agentes |
| `src/scene/screenTextures.ts` | Texturas canvas de pantallas, señalética, logos y reloj |
| `src/scene/KenneyModel.tsx` | Carga y caché de modelos CC0 de Kenney |
| `src/state/officeReducer.ts` | Estado de oficina derivado de eventos, checkpoints y actividad |
| `src/state/officeCopy.ts` | Textos de actividad, tareas y resultados de la demo |
| `src/state/officeLayout.ts` | Perfiles de agentes, rutas, waypoints, zonas y presets de cámara |
| `src/state/useOfficeLifeSim.ts` | Simulador ambiental autónomo |

## Flujo de estado

1. `App.tsx` recorre `MOCK_EVENTS` (34 eventos) con un cursor y play/pausa.
2. `officeReducer` convierte el historial de eventos en `OfficeSceneState`: agentes, checkpoint, artefactos y pulsos.
3. `OfficeCanvas` recibe ese estado y lo reparte entre arquitectura, puestos y agentes.
4. El simulador ambiental solo actúa sobre agentes `idle/completed` en su mesa; cualquier evento real lo expulsa.
5. La aprobación humana pausa el replay y muestra el checkpoint; al decidir, el estado continúa sin inventar éxito.

## Rendimiento

- Sombras de contacto **bakeadas en 1 frame** (`ContactShadows frames={1}`).
- Sombra direccional de 2048² y `dpr={[1, 2]}`.
- Bloom con `luminanceThreshold={1.08}` para no inundar la escena.
- Instancing para celosías y jardín vertical.
- Medición declarada en Chrome headless 1920×1080: **97–218 FPS** según vista, 0 errores de consola. Es una medición del prototipo, no una garantía en todos los equipos.
- El bundle principal ronda **1,66 MB minificado / 466 KB gzip**; Vite avisa de chunk > 500 KB. Pendiente de code-splitting si se prioriza arranque en red lenta.

## Accesibilidad

- Skip link, región `aria-live` para anuncios, botones con foco y etiquetas de grupo.
- Estados con texto e icono, no solo color.
- `reducedMotion` desactiva animaciones y simulador.
- Pendiente de validación manual: navegación completa por teclado y uso táctil/móvil real.

## Assets y licencias

Los modelos de mobiliario, naturaleza, coches y ciudad son **Kenney CC0**; el HDRI es **Poly Haven CC0**; el logo es el SVG oficial de `08_RECURSOS/brand/`. El detalle de origen, versión y modificaciones está en `08_RECURSOS/ASSETS.md`. No hay assets de pago ni fan art.

Los personajes son ficticios y de geometría propia. La [presentación pública del DAT Alierta](https://www.integratecnologia.es/noticias/integra-primera-empresa-privada-en-incorporarse-al-dat-alierta) orienta la luz natural y los espacios de trabajo y formación. [My Room in 3D](https://github.com/brunosimon/my-room-in-3d) se consultó como referencia de contraste entre materiales y luz ambiente; no se importaron sus archivos.

## Limitaciones conocidas

- Sin conexión a `apps/api/` ni streams SSE/LLM: todo el flujo es replay mock de 34 eventos.
- Sin persistencia ni reconexión real.
- Sin pruebas automatizadas de la escena 3D; la verificación es build + tipos + inspección visual.
- Pendiente de probar en móvil/táctil y de medir rendimiento en hardware de gama baja.
