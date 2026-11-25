# Estructura de oferta · Integra (borrador)

source_id: OFFER-INTEGRA-01
Tipo: borrador para el hackathon. **No es una plantilla oficial de Integra**; validar con negocio antes de usar en una propuesta real.

## 1. Principios

1. **Contexto antes que solución.** La oferta explica la oportunidad, el problema y el objetivo antes de proponer tecnología.
2. **Alcance explícito.** Lo incluido y lo excluido van en apartados separados; no se esconde en una nota al pie.
3. **Precio de catálogo.** La banda de precio sale del catálogo aprobado; el LLM no escribe importes ni descuentos.
4. **Supuestos visibles.** Todo lo que depende del cliente o de un tercero se marca como supuesto o dependencia.
5. **Documento, no JSON.** El entregable es DOCX/PDF; el JSON es la representación interna validable.
6. **Aprobación humana.** La oferta se marca «BORRADOR» hasta que una persona la aprueba.

## 2. Estructura

| # | Apartado | Contenido |
|---|---|---|
| 1 | Portada | Cliente, título, fecha, versión, logo y marca «borrador». |
| 2 | Contexto y oportunidad | Situación, señal detectada, relación previa y por qué ahora. |
| 3 | Objetivos | General, específicos y operativos, con indicadores. |
| 4 | Alcance | Incluido, excluido, límites y dependencias. |
| 5 | Solución propuesta | Componentes, arquitectura, metodología y decisiones. |
| 6 | Plan de trabajo | Fases, actividades, duración, participantes y hitos. |
| 7 | Equipo y gobernanza | Roles, dedicación, coordinación y cadencia. |
| 8 | Entregables | Documentos, sistemas, formación y criterios de aceptación. |
| 9 | Supuestos y exclusiones | Lo que no está validado y lo que no entra. |
| 10 | Inversión | Banda de catálogo, forma de pago y validez. |
| 11 | Siguientes pasos | Aprobación, arranque y contactos. |

## 3. Campos mínimos

- Cliente: razón social, nombre reducido, sector y ubicación.
- Oportunidad: identificador, origen, importe estimado y fecha.
- Objetivo general y objetivos específicos medibles.
- Alcance incluido y excluido.
- Solución: servicios, componentes y dependencias.
- Fases: nombre, propósito, contenido, participantes, duración y si es opcional.
- Equipo: roles y coordinador.
- Entregables y criterios de aceptación.
- Supuestos, exclusiones y riesgos.
- Banda de precio y validez.
- Fuentes: CRM, catálogo, arquitectura y conocimiento.

## 4. Reglas para el agente `offers`

1. Entradas obligatorias: `account_brief.json`, `architecture.json` y `catalog/services.json`.
2. Salida: `offer.json` validado + `offer.docx/pdf`.
3. Antes de redactar, comprobar que están todos los campos. Si falta uno, preguntar; no inventar.
4. Cada línea de precio lleva `service_id` y `price_band` del catálogo. Nunca un importe libre.
5. Los párrafos legales o condiciones fijas se copian de una fuente aprobada; si no existe, se marca `[PENDIENTE]`.
6. Usar `knowledge/writing_style.md`: hechos, acción, cliente protagonista y afirmaciones calibradas.
7. Mantener coherencia con los apartados ya cerrados; no contradecir alcance, fases ni cifras.
8. Marcar «BORRADOR» y no enviar hasta la aprobación humana.

## 5. Mapeo a `offer.json`

| Documento | Campo |
|---|---|
| Cliente y título | `client_id`, `title` |
| Contexto | `context`, `source_refs[]` |
| Objetivos | `objectives[]` |
| Alcance | `scope[]`, `exclusions[]` |
| Solución | `solution[]` |
| Fases | `phases[]` |
| Equipo | `team[]` |
| Entregables | `deliverables[]` |
| Supuestos | `assumptions[]` |
| Inversión | `price_band` |
| Validez | `valid_until` |

## 6. Pendiente

1. Obtener una plantilla oficial de Integra y validarla con negocio.
2. Definir el catálogo de servicios y las bandas de precio.
3. Acordar los párrafos fijos (confidencialidad, condiciones, aceptación).
4. Decidir si el PDF se genera desde DOCX o con un render propio.
