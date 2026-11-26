# Integra HQ · Oficina 3D flagship (`apps/web`)

Prototipo visual del hackathon: sede **DAT Alierta 2029** de **28 × 20 m**, 8 especialistas digitales, campus exterior y replay de **34 eventos**. Renderizado con **React Three Fiber + Three.js + Drei** en cámara ortográfica.

> Estado: **prototipo visual con replay mock**. No hay backend real, SSE ni LLM en vivo conectados. La UI lo declara en cabecera (`MOCK · REPLAY 34 EVENTOS`) y no simula éxitos en modo live. No es un producto oficial de Integra.

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

- **12 cámaras**: Oficina, Campus, Recepción, Dirección, Sala Alierta, Formación, Comercial, Soluciones, Diseño, Operación, Café y Terraza.
- **3 iluminaciones**: Día, Atardecer y Guardia IA (noche), con bloom selectivo y luces de acento.
- **Replay de 34 eventos**: play/pausa, salto por evento y checkpoint humano con aprobación/rechazo.
- **Vida simulada**: agentes libres que van a café, lounge, terraza, cabina, grada, academia o PC 1986; se cancela en cuanto reciben una tarea real.
- **Globos smart**: badges compactos en vistas amplias; el globo completo aparece al hacer hover, click, seguir a un agente o activarse un checkpoint.
- **Inspector**: estado, actividad, herramientas, fuentes, artefactos y eventos por agente.
- **Reduced motion**: desactiva desplazamientos y simulador ambiental; los estados siguen visibles.

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
| `src/App.tsx` | HUD, timeline de 34 eventos, inspector, checkpoints, presets y accesibilidad |
| `src/scene/OfficeCanvas.tsx` | Canvas, cámara ortográfica, luces, sombras, bloom, métricas FPS y rig de cámara |
| `src/scene/OfficeArchitecture.tsx` | Sede 28×20 m, atrio, salas, mobiliario, terraza, pérgola, celosías y Server Lab |
| `src/scene/CampusExterior.tsx` | Pabellones, monolito, aparcamiento EV, agua, bici, tráfico, peatones y horizonte |
| `src/scene/WorkstationDesks.tsx` | Puestos por rol y props diferenciados |
| `src/scene/SpecialistAgent.tsx` | 8 agentes, movimiento por waypoints, poses, badges y globos 3D |
| `src/scene/DataFlowPulses.tsx` | Pulsos de handoff entre agentes |
| `src/scene/screenTextures.ts` | Texturas canvas de pantallas, señalética, logos y reloj |
| `src/scene/KenneyModel.tsx` | Carga y caché de modelos CC0 de Kenney |
| `src/state/officeReducer.ts` | Estado de oficina derivado de eventos, checkpoints y actividad |
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

## Limitaciones conocidas

- Sin conexión a `apps/api/` ni streams SSE/LLM: todo el flujo es replay mock de 34 eventos.
- Sin persistencia ni reconexión real.
- Sin pruebas automatizadas de la escena 3D; la verificación es build + tipos + inspección visual.
- Pendiente de probar en móvil/táctil y de medir rendimiento en hardware de gama baja.
