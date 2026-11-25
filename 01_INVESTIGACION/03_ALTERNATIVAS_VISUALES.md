# Investigación gráfica ampliada

El equipo exploró SVG/HTML/CSS, Canvas 2D, Three.js/WebGL, generación procedural, vectorial, pixel art, retro HD y low-poly. Se observó que una pixelación fuerte no crea automáticamente buen pixel art. No se han evaluado comparativamente los recursos profesionales todavía.

| Alternativa | Calidad potencial | Complejidad | Riesgo principal | Decisión |
|---|---|---|---|---|
| 2D isométrico, sprites profesionales | Alta | Baja-media | Compatibilidad de perspectiva, poses | Finalista A |
| 3D ortográfico, modelos profesionales | Alta | Media | Rigging, luz, descarga, GPU | Finalista B |
| 3D prerender + 2D | Alta | Media | Preparación Blender y capas | Finalista C |
| HD-2D realtime | Alta | Alta | Mezclar 2D y 3D, sombras/escala | Solo si sale gratis en B |
| 3D procedural puro | Media | Media | Acabado de cubos, detalle manual | Contingencia o arquitectura simple |
| SVG/Canvas procedural | Media | Baja-media | Apariencia genérica | Mock y contingencia |
| Imagen IA + overlays | Alta estática | Baja | Oclusiones, consistencia y edición | Fallback/fachada |
| Voxel | Media | Media | Dirección estética distinta | Backlog |

No son benchmarks. Se ponderará calidad de escena 35%, esfuerzo 30%, flexibilidad 10%, fluidez 10%, impacto demo 15%; la licencia es una condición eliminatoria. No comparar solo una imagen: medir trabajo necesario para importar, animar y personalizar un personaje.

## Recursos sin compra

Ver catálogo `08_RECURSOS/assets.csv`. Principales: Kenney Furniture Kit CC0 (3D y versión con renders 2D), MrEliptik Office CC0, KayKit Furniture Bits CC0, VNB Office CC BY 4.0, Quaternius personajes y animaciones CC0 (versión Standard), Poly Haven CC0. ThirdAngle y Antahonist son gratuitos con prohibiciones de redistribución de assets sueltos; no empaquetarlos de nuevo ni publicar sus sprites originales sin revisar las condiciones. Mixamo es gratuito con cuenta y uso condicionado; no es CC0. No comprar versiones Pro/Source ni usar cuentas ajenas.

## Recursos comerciales que se investigaron pero se excluyen

Synty POLYGON Office Pack, JustCreate3D Low Poly Office Interiors, Pixel Salvaje Isometric Interiors/Character Template, LimeZu Modern Interiors de pago y packs de Fab/Sketchfab no gratuitos. Sirven para estudiar composición/estilo, no son dependencias del MVP. Buscar en Fab y Sketchfab solamente fichas con precio cero y licencia compatible, no usar un modelo solo porque se puede visualizar o descargar. No asumir que todos los modelos en una plataforma son libres.

## Herramientas

- 2D: [PixiJS](https://pixijs.com/), [Phaser](https://phaser.io/), Canvas nativo, [Tiled](https://www.mapeditor.org/) para edición de mapas si hace falta, [LibreSprite](https://libresprite.github.io/) o [Piskel](https://www.piskelapp.com/) para sprites. Aseprite oficial precompilado es comercial: no es dependencia gratuita obligatoria.
- 3D: [Three.js](https://threejs.org/), [React Three Fiber](https://github.com/pmndrs/react-three-fiber), [Drei](https://github.com/pmndrs/drei), [Blender](https://www.blender.org/), [glTF-Transform](https://gltf-transform.dev/), [gltfjsx](https://github.com/pmndrs/gltfjsx). Emparejar versiones React/Fiber compatibles, fijar lockfile.
- Prerender: [Sprite Sheet Maker](https://extensions.blender.org/add-ons/sprite-sheet-maker/), [repo](https://github.com/ManasMakde/SpriteSheetMaker). La ficha indica Blender 5.1+ para su versión revisada; usar versión compatible. Alternativa script Blender Python.
- UI: React/Vite, CSS, SVG, [Motion](https://motion.dev/) (núcleo open source), [Lucide](https://lucide.dev/), [Radix](https://www.radix-ui.com/) opcional, Zustand opcional. No depender de servicios de diseño de pago.
- Pruebas: [Playwright](https://playwright.dev/), Vitest o Node test. Usar browser real corporativo y mediciones de FPS/carga. No usar un benchmark de software renderer para prometer FPS de GPU.
- Generación IA: ChatGPT para concept art si hay acceso, Claude Code/Codex para programación si hay licencia/cuenta. Alternativa sin consumo IA: código y recursos gratuitos. Las suscripciones y llamadas no son necesariamente gratis.
