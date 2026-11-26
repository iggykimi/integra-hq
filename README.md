# Integra HQ · Real Hack 2026
**Dossier de arranque, oficina 3D flagship y plan de ruta del equipo | 26/11/2026**

> Una empresa agéntica real, visible como una oficina 3D viva. Zaragoza, 2029: una interpretación creativa del futuro de Integra.

Este repositorio consolida la investigación, el alcance del MVP, los contratos JSON Schema, los fixtures sintéticos, una **oficina 3D flagship (React Three Fiber)** ejecutable en `apps/web/` —sede DAT Alierta de 28×20 m, 8 especialistas y replay de 34 eventos— y una **demo CLI mock/live para Azure OpenAI (`gpt-6-luna`)**. La escena funciona hoy con **replay mock**; el backend real (`apps/api/`), SSE y LLM en vivo aún no están conectados. No es la aplicación completa desplegada: es la base visual y contractual para pasar a construir.

---

## 1. Decisiones ya cerradas

- **Historia y alcance:** un **ciclo completo de negocio** en **180 segundos** sobre cliente ficticio (**Nortia Industrial**): señal CRM → pregunta humana de alcance → requisitos + arquitectura SVG → oferta DOCX/PDF → **pausa para aprobación humana** → plan de proyecto PDF + borrador de factura PDF → presentación PPTX (6 diapositivas). Incluye un segundo flujo corto (solo arquitectura Microsoft Fabric) para demostrar delegación variable.
- **Equipo digital:** **1 director + 7 especialistas** (`crm`, `consultant`, `architect`, `offers`, `delivery`, `billing`, `designer`) en **5 zonas** (Dirección, Comercial, Soluciones, Comunicación, Operación). `delivery` y `billing` entran deterministas para garantizar velocidad y fiabilidad.
- **Renderer elegido (tras spike A vs B):** **3D ortográfico con React Three Fiber + Three.js + Drei** (`spikes/renderer-ab/`), con globos de comentarios operativos en 3D (`<Html>`) y movimiento por waypoints ligado a eventos reales. No se construyen renderers alternativos en paralelo.
- **Escena principal:** `apps/web/` implementa la sede flagship **DAT Alierta 2029 de 28×20 m** con 12 presets de cámara, 8 agentes, campus exterior, terraza en voladizo, vida simulada y replay de **34 eventos**. El spike `spikes/renderer-ab/` se conserva como evidencia del A/B, no como producto.
- **Modelo base confirmado:** **Azure OpenAI con `gpt-6-luna`** en la suscripción de Integra (1,1M de contexto, baja latencia y coste), tras un adaptador de proveedor que permite subir dirección/arquitectura a `gpt-6.1-sol` o `gpt-6.2-sol` si las pruebas lo piden.
- **Reglas no negociables:**
  - Sin secretos en el frontend ni en el repositorio; sin conexión a CRM/ERP ni correos reales.
  - Los números, fechas, bandas de precio y aging se calculan en código contra datos versionados; los documentos se generan desde plantillas deterministas (nunca ejecutando código del LLM).
  - Modos **`LIVE` / `REPLAY` / `MOCK`** siempre visibles; jamás simular un éxito en `live`.
  - Sin compra de assets: solo originales propios o recursos CC0/MIT/CC BY auditados en `08_RECURSOS/ASSETS.md`.

---

## 2. Cómo probarlo hoy en local (2 minutos)

Requisitos: Node LTS (`>=20`). `apps/web` usa npm; el spike histórico usa pnpm.

1. **Abrir la oficina 3D flagship (sede 28×20 m, 12 cámaras y replay de 34 eventos):**
   ```bash
   cd apps/web
   npm install
   npm run dev
   ```
   Abrir **`http://127.0.0.1:5173/`**. Probar los 12 presets, las luces **Día / Atardecer / Guardia IA**, el play del timeline, los checkpoints humanos, los globos smart, la vida simulada y el clic en agentes, pizarras, café o PC 1986.

2. **Ver el spike A/B original (referencia, 1 escritorio):**
   ```bash
   cd spikes/renderer-ab
   pnpm install
   pnpm dev
   ```
   Abrir **`http://localhost:5173`** (seleccionar **Solo B (3D R3F)** para verlo a pantalla completa, probar estados, **Esperando aprobación** con botones en el globo y **Probar caminar (pizarra)**).

3. **Probar el flujo de planificación y cálculos deterministas en CLI (sin dependencias):**
   ```bash
   # Mock ciclo completo con formación (42.000 € – 58.000 €, 428 h)
   node scripts/demo-luna-plan.mjs

   # Mock sin formación (36.000 € – 50.000 €, 380 h) y flujo secundario Fabric
   node scripts/demo-luna-plan.mjs --training=no
   node scripts/demo-luna-plan.mjs --scenario=arch
   ```
   Para probarlo en **`--live`** contra el deployment de **Azure OpenAI `gpt-6-luna`**, copia `.env.example` a `.env` (ignorado por git), rellena `AZURE_OPENAI_ENDPOINT` y `AZURE_OPENAI_API_KEY` y lanza:
   ```bash
   node scripts/demo-luna-plan.mjs --live
   node scripts/demo-luna-plan.mjs --live --scenario=arch
   ```

4. **Validar contratos, DAGs, 34 eventos y fixtures sintéticos:**
   ```bash
   node scripts/validate-dossier.mjs
   ```

### La escena flagship en detalle

- **Sede:** 28×20 m con atrio a doble altura, escalera, pared corporativa azul con logo Integra y reloj analógico 3D en hora real.
- **Salas:** Sala Alierta para 8 plazas, Academia Integra reactiva a `includesTraining`, Grada IntegraTalks de roble, 2 cabinas acústicas, Data & AI Server Lab acristalado con 3 racks y Terraza Exterior en voladizo con pérgola cerámica.
- **Campus:** 4 pabellones tecnológicos, monolito DAT Alierta · INTEGRA, aparcamiento con 4 cargas EV y 3 coches CC0, lámina de agua, carril bici con ciclista, peatones, tráfico y pradera fundida al horizonte con `<fog>`.
- **Legibilidad:** badges icónicos compactos en Oficina/Campus; al hacer hover, clic, seguir a un agente o activarse un checkpoint se despliega el globo completo.
- **Rendimiento:** sombras de contacto bakeadas en 1 frame, bloom selectivo, `InstancedMesh` para 180 celosías y 112 módulos de jardín vertical, y 12 presets de cámara en una sola barra a 1080p.
- **Detalle técnico y límites:** ver `apps/web/README.md`.

---

## 3. Plan de ruta (hoja de ruta de implementación)

| Fase | Objetivo | Entregable concreto | Estado |
|---|---|---|---|
| **Fase 0 · Base y decisiones** | Alcance 8 agentes, contratos JSON Schema, fixtures de Nortia Industrial, validación automática, elección de 3D R3F y `gpt-6-luna`. | `07_CONTRATOS/`, `spikes/renderer-ab/`, `scripts/` | **Hecho** |
| **Fase 1 · Backend vertical + documentos** | API Fastify + orquestador DAG (máx. 8 tareas, concurrencia 2) + checkpoint de pausa/reanudación (`run.paused/resumed`) + adaptador Azure OpenAI `gpt-6-luna` + generadores deterministas DOCX/PDF/SVG/PPTX. | `apps/api/`, `packages/core/`, `packages/documents/` funcionando en `mock` y `live` | **Siguiente** |
| **Fase 2 · Oficina 3D (5 zonas, 8 roles)** | Evolucionar el spike R3F a 1 planta con 5 zonas, 8 puestos, comentarios operativos 3D, movimiento por waypoints conectado al polling de eventos, panel de pregunta/aprobación e inspector. | `apps/web/` con sede flagship 28×20 m, 12 cámaras, 8 agentes, campus exterior y replay de 34 eventos. Falta conectar backend/SSE real, aprobación contra API y pruebas táctiles/teclado. | **Parcial** |
| **Fase 3 · Persistencia, pruebas y ensayo 180 s** | Snapshot + reconexión sin repetir tareas, suite funcional F1–F16 (`05_DESARROLLO/03_PRUEBAS.md`), medición de latencia real con `gpt-6-luna` y grabación de un `replay` real etiquetado. | Demo ensayada de 180 s + contingencia `replay` | Pendiente |
| **Fase 4 · Despliegue y extras (solo si P0 pasa)** | Azure Container Apps + Blob Storage en Resource Group de Integra (local como contingencia), panel de costes/tokens, easter egg 1986 o trigger Outlook P1. | URL de demo + extras opcionales | Opcional (P1) |

**Orden de recorte si aprieta el tiempo** (detalle en `05_DESARROLLO/01_PLAN.md`): (1) PPTX → resumen visual (la oferta DOCX/PDF **no** se recorta); (2) `delivery` y `billing` 100% deterministas; (3) segunda petición como plan mostrado; (4) extras P1 fuera. **Nunca se recorta:** aprobación humana con pausa/reanudación, trazabilidad, oferta real y estados de error honestos.

---

## 4. Dudas y preguntas abiertas para hablar en equipo

Dejamos aquí los puntos concretos que conviene cerrar entre todos antes de arrancar la Fase 1:

1. **Estilo 3D de personajes y mobiliario (Candidato B, ya implementado):**
   - La escena `apps/web/` combina **agentes estilizados propios** con **mobiliario CC0 de Kenney**. ¿Mantenemos esta mezcla por velocidad o sustituimos parte del mobiliario por geometría propia antes del cierre?
2. **Validación real de `gpt-6-luna` como Director:**
   - Al ejecutar `node scripts/demo-luna-plan.mjs --live` con las credenciales de la suscripción de Integra: ¿`gpt-6-luna` devuelve planes DAG impecables en los dos escenarios (ciclo completo y solo Fabric) con latencia cómoda, o conviene subir solo el `director` (o `architect`) a `gpt-6.1-sol` / `gpt-6.2-sol`?
3. **Catálogo de servicios y plantilla de oferta:**
   - ¿Nos sirven las 5 líneas y bandas sintéticas de `07_CONTRATOS/fixtures/data/catalog/services.json` (`36.000 € – 58.000 €`, marcadas «pendiente de validación comercial») o alguien de negocio quiere ajustar nombres, entregables o párrafos fijos de `04_AGENTES/knowledge/proposals.md`?
4. **Reparto de bloques del equipo:**
   - ¿Cómo nos repartimos los 4 frentes de trabajo?
     - **A — Escena 3D y UX** (5 zonas, 8 agentes, waypoints, comentarios 3D, panel aprobación/inspector).
     - **B — Orquestador y LLM** (Fastify, DAG, pausa/reanudación, adaptador Azure OpenAI `gpt-6-luna`, eventos).
     - **C — Documentos deterministas** (oferta DOCX+PDF directo desde JSON, plan PDF, factura borrador PDF, SVG, PPTX).
     - **D — Pruebas, guion 180 s e infraestructura** (F1–F16, medición latencia/tokens, replay real y Azure).
5. **Despliegue en Azure vs. demo local:**
   - ¿Tenemos permisos y cuota confirmados en el Resource Group de Integra para desplegar Container Apps + Blob Storage, o acordamos ir con **backend/frontend local + Azure OpenAI `gpt-6-luna` en nube** para eliminar riesgo de red/infraestructura el día de la demo?
6. **Permisos de marca y extras P1:**
   - ¿Confirmamos que el permiso de uso del logo SVG de `08_RECURSOS/brand/` cubre el repositorio/demo del hackathon (siempre con la nota «no es un producto oficial»)?
   - ¿Coincidimos en dejar **Outlook (Power Automate/Graph)** y la **intro de 7 s** estrictamente en P1 hasta tener P0 cerrado?
7. **Criterio del jurado y duración exacta:**
   - ¿Se confirman los **180 segundos** de demo o hay otro formato de presentación/preguntas? ¿Qué pesa más en la evaluación (arquitectura agéntica real, impacto visual 3D, entregables descargables o encaje con el ecosistema Microsoft/Integra)?

---

## 5. Índice del repositorio

| Carpeta | Contenido |
|---|---|
| `00_PROYECTO` | Reto, visión, alcance MVP (P0/P1) y registro de decisiones (ADR) |
| `01_INVESTIGACION` | Empresa/DAT Alierta, referentes, alternativas visuales, fuentes e informe 2026 (Ignite 2026, MCP/A2A/AG-UI, EU AI Act/AESIA) |
| `02_DISENO` | Dirección artística, UX 1080p, pipelines gratuitos y resultado del spike A vs B |
| `03_TECNICA` | Arquitectura, API/eventos, herramientas/entregables, despliegue y seguridad (OWASP Agentic / OTel GenAI) |
| `04_AGENTES` | Registro (`agents.json`), esquema de empresa agéntica, prompts de los 8 roles y conocimiento base |
| `05_DESARROLLO` | Plan de tickets, guion cronometrado de 180 s, matriz de pruebas F1–F16 y prompts de desarrollo |
| `06_PROTOTIPO_OFFLINE` | Prototipo HTML SVG histórico de 4 agentes (referencia UX sin dependencias) |
| `07_CONTRATOS` | 9 JSON Schema Draft 2020-12, `types.ts`, 2 planes DAG, 34 eventos mock y 4 fixtures sintéticos de negocio |
| `08_RECURSOS` | Catálogo CSV de assets libres, control de licencias y kit oficial de marca (`brand/`) |
| `apps/web` | Oficina 3D flagship: sede 28×20 m, 12 cámaras, 8 agentes, campus, simulador y replay de 34 eventos (ver `apps/web/README.md`) |
| `spikes/renderer-ab` | Spike interactivo 1 escritorio (2D vs **3D R3F ganador**, comentarios 3D y caminar por waypoints) |
| `scripts` | Validador automático (`validate-dossier.mjs`) y demo CLI mock/live (`demo-luna-plan.mjs`) |

### Qué incluye y qué no

Incluye documentación, contratos, fixtures sintéticos, kit de marca con los 3 SVG oficiales del logo, prototipo offline histórico, **oficina 3D flagship ejecutable en `apps/web/`**, spike 3D R3F de referencia y scripts de validación/demo. **No incluye** secretos, claves, datos de clientes reales, la presentación corporativa completa, fotos de stock, assets de pago ni servicios Azure aprovisionados. «Gratis» se refiere a no comprar assets ni software; el consumo de LLM/Azure depende de la suscripción utilizada.

*Última actualización y verificación de fuentes: 26 de noviembre de 2026.*
