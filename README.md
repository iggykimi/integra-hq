# Integra HQ · Real Hack 2026
**Dossier de investigación y arranque de proyecto | 26/11/2026**

> Una empresa agéntica real, visible como una oficina viva. Zaragoza, 2029: una interpretación creativa del futuro de Integra.

Este paquete consolida las conversaciones de concepto, alcance, identidad de Integra, arquitectura agéntica, experimentación visual y búsqueda de recursos. Es una base de trabajo para el equipo y para Claude Code/Codex, **no una aplicación multiagente ya desplegada**.

## Cómo utilizarlo

1. Lee `00_PROYECTO/01_RETO_Y_VISION.md` y `02_ALCANCE_MVP.md`: son el marco de decisión.
2. Consulta `01_INVESTIGACION/` para fuentes primarias, repositorios y recursos gratuitos. El CSV de assets es la lista operativa de descargas.
3. Abre `02_DISENO/` para las referencias de marca, composición, brief artístico y los experimentos A/B/C. La representación gráfica definitiva sigue abierta.
4. Revisa `03_TECNICA/` y `04_AGENTES/` antes de construir. Los contratos y prompts son propuestas editables.
5. Ejecuta la demostración local abriendo `06_PROTOTIPO_OFFLINE/index.html` en el navegador. No necesita instalar nada ni usar una API. **Es una simulación de estados con datos sintéticos**, no prueba de ejecución de LLM. Es el mock histórico de 4 agentes; el MVP actual tiene 8 roles y aprobación humana.
6. Usa `05_DESARROLLO/` para repartir trabajo, probar el flujo y ensayar la demo.

## Decisiones firmes

- Un director y siete especialistas; cinco zonas; una demo de 180 segundos.
- Un ciclo completo: señal de oportunidad, oferta, aprobación humana, proyecto y borrador de factura.
- La coordinación y los documentos deben ser reales; las animaciones deben responder a eventos verificables.
- La persona interviene al menos una vez y aprueba la oferta antes de que salga.
- La oferta, el plan de proyecto y la factura se entregan en DOCX/PDF; el JSON es la representación interna validable.
- No comprar assets. Priorizar CC0, MIT para código y CC BY con atribución; otros recursos gratuitos solo si la licencia permite el uso concreto.
- React/TypeScript y un backend sencillo; el renderer queda desacoplado hasta comparar 2D, 3D y prerenderizado.
- Un flujo principal end-to-end y una segunda petición para probar delegación variable, con contingencia replay claramente etiquetada.
- No duplicar una plataforma de agentes existente, ni desarrollar un juego completo.

## Qué incluye y qué no

Incluye documentación, catálogo de recursos con enlaces, checklist de licencias, definición de agentes, prompts, esquemas JSON, escenario ficticio, fixture de eventos, modelo visual conceptual original, kit de marca con los SVG oficiales del logo, replay HTML offline y guías de implementación. No incluye la presentación corporativa completa, fotos de stock, iconos propietarios ni logos de partners; tampoco modelos 3D descargados. Se facilitan las fuentes oficiales y los pasos de adquisición. No se incluyen fuentes de pago, claves, cuentas, acceso interno ni recursos Azure creados. La infraestructura y el consumo de LLM podrían tener coste; «gratis» significa aquí **sin compra de recursos gráficos ni herramientas de desarrollo obligatorias**. El modo offline sí funciona sin consumo de API.

## Índice

| Carpeta | Contenido |
|---|---|
| `00_PROYECTO` | Reto, visión, MVP, ideas y decisiones |
| `01_INVESTIGACION` | Investigación visual, empresa, recursos, repositorios, fuentes |
| `02_DISENO` | Identidad, arte, interfaz, pipelines y pruebas |
| `03_TECNICA` | Arquitectura, eventos, API, infraestructura, seguridad |
| `04_AGENTES` | Prompts, catálogo, conocimiento y esquema de entregables |
| `05_DESARROLLO` | Backlog, pruebas, demo de 3 minutos y guías para IA |
| `06_PROTOTIPO_OFFLINE` | Replay visual original y autocontenido |
| `07_CONTRATOS` | JSON Schema (8 agentes y entregables), fixtures sintéticos y tipos TypeScript |
| `08_RECURSOS` | Catálogo CSV, instrucciones de adquisición, control de licencias |
| `scripts` | Validador automático de contratos, DAG, eventos, fixtures y enlaces (`validate-dossier.mjs`) |

La propuesta de organización de la empresa agéntica está en `04_AGENTES/02_ESQUEMA_EMPRESA_AGENTICA.md`; la investigación de mercado, Ignite 2026, protocolos (MCP/A2A/AG-UI), regulación (EU AI Act/AESIA) y modelos, en `01_INVESTIGACION/05_EMPRESA_AGENTICA_2026.md`. El kit de marca (logos, tokens y muestra visual) está en `08_RECURSOS/brand/`.

Para verificar la integridad del dossier y los contratos en local (requiere Node LTS, sin dependencias): `node scripts/validate-dossier.mjs`.

La fecha de revisión de las fuentes es 26 de noviembre de 2026. Los enlaces pueden cambiar. Se distingue entre información publicada, propuestas de diseño e hipótesis técnicas no probadas.
