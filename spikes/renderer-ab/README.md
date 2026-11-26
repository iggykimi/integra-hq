# Spike comparativo visual · Candidato A (2D Isométrico) vs Candidato B (3D R3F)

Microescena comparativa de **un solo escritorio** conforme a `02_DISENO/04_PRUEBA_COMPARATIVA.md`:
- Mismo mobiliario y framing aproximado 2:1 (escritorio blanco, silla, dos monitores activos, personaje sentado, planta, ventana con celosía terracota estilo DAT Alierta y distintivo oficial SVG de Integra sin duplicar ficheros).
- **Estado compartido único** (`src/state/deskReducer.ts`): ambos renderers consumen exactamente los mismos estados (`idle`, `working`, `waiting`, `completed`, `error`) y el fixture real `07_CONTRATOS/fixtures/events.mock.json`.
- **Métricas en vivo:** FPS, tiempo medio de frame (ms) y tiempo de primer render (ms) por candidato.
- **Matriz de decisión integrada** con los pesos oficiales: calidad gráfica (35%), facilidad (30%), flexibilidad (10%), rendimiento (10%) e impacto demo (15%).

## Cómo ejecutarlo localmente

```bash
cd spikes/renderer-ab
pnpm install
pnpm dev
```

Abrir `http://localhost:5173`. Para comprobar tipos y compilación:

```bash
pnpm build
```

## Notas de honestidad y licencias

- Modo exclusivamente **MOCK · DATOS SINTÉTICOS** (sin llamadas a LLM ni generación de documentos).
- Ambos candidatos usan geometría/trazado original sin compra de assets. Si gana **A**, el canvas está listo para sustituir capas por sprites CC0 (p. ej. Kenney Furniture Kit 2D). Si gana **B**, la escena R3F está lista para cargar modelos GLB CC0/CC BY (Kenney, MrEliptik, VNB, Quaternius) registrados en `08_RECURSOS/ASSETS.md`.
- El logo oficial de Integra se referencia directamente desde `08_RECURSOS/brand/` (permiso para hackathon; no producto oficial).
