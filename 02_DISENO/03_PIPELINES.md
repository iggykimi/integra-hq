# Pipelines gráficos gratuitos

## A · 2D isométrico

Descargar Kenney Furniture Kit (incluida versión OpenGameArt con renders 2D), ThirdAngle starter o Antahonist para evaluación local. No redistribuir los dos últimos paquetes. Usar un mismo tamaño de tile y dirección de luz, pivot al pie/base del objeto, coordenadas de mapa y orden de dibujo por profundidad. Probar 2:1, no mezclar sprite top-down. Para personaje: editar sprite original o renderizar rig CC0 con cámara dimétrica y animaciones. Renderizar con PixiJS o Canvas si la escena tiene 4–8 personajes; HTML/SVG para etiquetas y accesibilidad. `image-rendering: pixelated` solo en gráficos pixel art. Tiled es opcional; un JSON de posiciones basta.

## B · 3D estilizado

Descargar VNB Office (CC BY con crédito), Kenney y MrEliptik (CC0); KayKit para complementos solo si encaja. Descargar Quaternius Standard, revisar prendas y rigs disponibles y Universal Animation Library Standard. Usar Blender para normalizar escala, ejes, pivots, texturas y exportar GLB. No asumir que rig de Mixamo y Quaternius se retargetea sin trabajo. Priorizar un personaje con idle/sit y un ciclo de typing si existe; no prometer animación que no se haya probado. Crear 8 variantes (o 4 reutilizadas con cambios de color/accesorios). Geometría procedural para suelos, paredes y celosías; no para cada silla o monitor.

React Three Fiber y Drei: `useGLTF`, `useAnimations`, cámara ortográfica, luces y sombras de contacto. Usar instancias/clones adecuados para personajes independientes (SkeletonUtils.clone cuando corresponda). Carga diferida y precarga en demo. `CanvasTexture` en pantallas para representación dinámica de plan, diagrama o slides. Iluminación natural, HDRI de Poly Haven opcional, materiales coherentes; sin postprocesado pesado inicialmente. Probar sombras y consumo real.

Ejemplo de comandos (no ejecutados aquí):

```sh
npx gltfjsx office.glb --transform --types
# Consultar la versión concreta de glTF-Transform antes de aplicar opciones.
npx @gltf-transform/cli --help
```

Conservar originales fuera de `public`, licencias, textura y paleta. Comprobar que la optimización mantiene animaciones y materiales, que los decoders necesarios se sirven localmente y que las rutas funcionan al desplegar.

## C · Blender prerenderizado + 2D

Reutilizar exactamente los modelos de B. Cámara fija, suelo/objetos estáticos renderizados en una imagen WebP/PNG, capa de primer plano (escritorios, paredes, mamparas) y 4–8 spritesheets RGBA con poses/animaciones. Mantener misma cámara y luz en todas las exportaciones. Renderizar sombras de personaje separadas si cambian con pose. Definir anclas normalizadas y orden de capas. [Sprite Sheet Maker](https://extensions.blender.org/add-ons/sprite-sheet-maker/) o script Python Blender. Si buscamos pixel art, usar resolución de render deliberada, paleta, contornos, antialiasing controlado y corrección manual; no aplicar pixelación fuerte al final. Alternativa HD: mantener render nativo con estilo diorama.

## Fallback de rapidez

Ilustración IA sin personas + overlays + sprites CC0; composición por HTML/SVG y anclas. Es más difícil recolocar muebles; considerar oclusiones y uniformidad. Si no hay generación de imagen disponible, construir una escena SVG original sencilla y usar recursos libres. No se necesita comprar software ni una librería de efectos.

## Control de calidad

Captura a 1080p; escala 100%, zoom y DPR; evitar desenfoque; probar accesibilidad por teclado; evaluar CPU/GPU en portátil; medir tamaño de descarga, primer render, FPS y memoria. Evitar sombreado/material hiperrealista junto a personajes caricaturescos. Todas las alternativas consumen `OfficeState` compartido; elegir una después del spike.
