# Empresa agéntica 2026 · investigación para Integra HQ

> Revisión: 26/11/2026. Se distingue entre **hecho con fuente**, **dato de tercero no auditado** e **hipótesis**.
> Objetivo: acotar. Qué existe, qué se puede reutilizar y qué no conviene construir.

## Resumen ejecutivo

1. **La idea ya es una categoría.** Paperclip (117k estrellas, MIT), OneManCompany, MetaGPT, ChatDev, CrewAI y las plataformas de Microsoft, Salesforce y SAP venden exactamente «un equipo de agentes con un jefe». La oficina visual y el organigrama no diferencian por sí solos.
2. **El diferencial de Integra es el trabajo, no el orquestador.** Cuenta, oportunidad, requisitos, arquitectura, oferta, entrega y cobro son procesos que Integra conoce y que un agente genérico no puede resolver sin datos, catálogo y criterio.
3. **2026 ya trae la infraestructura.** GPT-6.1 Sol/Terra, GPT-6 Luna, Claude Opus 5.5/Fable 5.2, Microsoft Foundry, Copilot Studio, Agent 365, Dynamics 365 y Business Central. No hace falta construir una plataforma de agentes; hace falta integrarla con criterio.
4. **Los agentes commodity se compran.** Microsoft ya vende agentes de cualificación de leads, pedidos de venta, facturas de proveedor y conciliación. Reconstruirlos para una demo es tiempo perdido; orquestarlos y aportar el contexto de Integra sí aporta.
5. **Corte recomendado:** ocho agentes, un ciclo completo con aprobación humana, datos sintéticos y un DAG propio. Proyectos y facturación entran simulados; la demo no debe tener nueve agentes a medias.

## 1. La categoría: de «chatbot» a «empresa de agentes»

### 1.1 Agent company OS

| Proyecto | Qué es | Señal | Lectura |
|---|---|---|---|
| [Paperclip](https://github.com/paperclipai/paperclip) | Servidor Node + UI React para gestionar un equipo de agentes: organigrama, tareas, presupuestos, aprobaciones, rutinas, gateway MCP y registro de actividad | MIT, 117k★ (25/11/2026) | Es la referencia más cercana a «empresa agéntica». Aporta el modelo de gobierno; no el flujo de una consultora. |
| [OneManCompany](https://github.com/1mancompany/OneManCompany) | «Sistema operativo» de una empresa de agentes con oficina pixel art, organigrama, contratación, reuniones y evaluaciones | Apache-2.0, 474★ | Demuestra que la oficina visual funciona como interfaz de tareas reales. Su teatro de RR. HH. no encaja en Integra. |
| [MetaGPT](https://github.com/FoundationAgents/MetaGPT) | Empresa de software simulada con SOP, roles y artefactos | MIT, ~65k★ | El patrón «rol + SOP + entregable» es reutilizable; el dominio es generar software. |
| [ChatDev](https://github.com/OpenBMB/ChatDev) | Empresa virtual de desarrollo de software con agentes que colaboran | Apache-2.0 | Inspiración conceptual; no es un backend para producción. |

Lo que estos proyectos demuestran: el organigrama, la asignación de tareas, las puertas de aprobación y la interfaz visual son un patrón conocido. Lo que no demuestran: que un agente genérico resuelva el trabajo de una consultora española con datos de cliente, catálogo de servicios y criterios comerciales.

### 1.2 «AI employees»

Artisan (AI BDR), Sierra y Decagon (atención al cliente), Lindy (AI teammate), Sintra (empleados por rol), 11x, Relevance AI. El patrón común: **un rol, un conjunto de herramientas, un resultado medible y una aprobación humana para lo externo**. El precio tiende a ir por resultado, asiento o consumo, no por «acceso al modelo».

Lo aprovechable: la narrativa de rol con nombre y responsabilidad, y la medición por tarea terminada. Lo que no se debe copiar: prometer autonomía total cuando el 80 % de los pasos acaban en una revisión humana.

### 1.3 Plataformas enterprise

| Plataforma | Estado a 25/11/2026 | Qué aporta a Integra HQ |
|---|---|---|
| [Microsoft Agent 365](https://www.microsoft.com/en-us/microsoft-agent-365) | GA desde 01/05/2026; 15 USD/usuario/mes; ampliado en **Ignite 2026 (nov. 2026)** con **FinOps para IA** y analítica de negocio | Registro de agentes, identidad (Entra), observabilidad, Purview, Defender y control de gasto por agente. Es la capa de gobierno para una producción real. |
| [Microsoft Foundry](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/workflow) | GPT-6.2 GA; workflows multiagente en preview; hosted agents; A2A; en **Ignite 2026**: Foundry en AKS (preview), voice/browser automation GA y Windows 365 for Agents (preview) | Ejecución, modelos, trazas y despliegue. El MVP no lo necesita para funcionar, pero es la salida natural a producción. |
| **Microsoft IQ** (Ignite 2026) | Anunciado en noviembre de 2026; unifica Work IQ, Fabric IQ, Foundry IQ y Web IQ | Capa semántica y de conocimiento sobre Microsoft Fabric para dar una «única versión de la verdad» a todos los agentes. Sustituye a nuestros `knowledge/*.md` al escalar. |
| [Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/whats-new) | Orquestación multiagente GA; en **Ignite 2026**: Copilot Studio Apps (runtime gestionado GA), Windows 365 for Agents y conectores cross-cloud (*Copilotforce*) | Alternativa low-code para publicar en Teams/Outlook. Útil si Integra quiere que el director viva en Microsoft 365. |
| [Dynamics 365 Sales](https://learn.microsoft.com/en-us/dynamics365/sales/sales-qualification-agent) | Sales Qualification Agent GA; Sales Development Agent en preview (octubre de 2026) | Agentes de cualificación y prospección. No reconstruir; conectar. |
| [Business Central](https://learn.microsoft.com/en-us/dynamics365/business-central/ai-in-bc) | Sales Order Agent y Payables Agent GA; varios buzones por empresa desde otoño de 2026 | Agentes de pedidos y facturas de proveedor. El coste se mide en Copilot Credits; un ejemplo de Microsoft para 100 solicitudes de pedido ronda 1.650 créditos/mes. |
| [Salesforce Agentforce](https://www.salesforce.com/agentforce/multi-agent-orchestration/) | Orquestación multiagente GA en 2026; Atlas; A2A | Referencia de «front door» que enruta a especialistas y conserva contexto. |
| [SAP Agent Ready](https://portalerp.com/es/noticia/sap-impulsa-desde-espana-una-iniciativa-para-acelerar-la-ia-agentica-empresarial) | Iniciativa en Madrid con Inetum, SEIDOR e Indra | Señal de que la competición en España ya está en marcha; Integra no parte de cero. |

La guerra de plataformas se libra en gobernanza, identidad y datos, no solo en el modelo. Para el hackathon, la consecuencia práctica es clara: **no construir lo que ya existe; construir la capa que une esos agentes con el trabajo de Integra.**

## 2. Repositorios de GitHub que merece la pena mirar

| Repositorio | Licencia | Qué tomar | Qué no tomar |
|---|---|---|---|
| [paperclipai/paperclip](https://github.com/paperclipai/paperclip) | MIT | Organigrama, presupuestos, aprobaciones, rutinas, registro de actividad, gateway MCP | La app completa; la contratación y el despido de agentes |
| [1mancompany/OneManCompany](https://github.com/1mancompany/OneManCompany) | Apache-2.0 | Oficina pixel art ligada a tareas, árbol de tareas, reuniones, cadena de aprobación | El teatro de RR. HH.; la promesa de empresa autónoma |
| [Microsoft Agent Framework](https://learn.microsoft.com/en-us/agent-framework/) | MIT | Cinco patrones: secuencial, concurrente, handoff, group chat y Magentic; checkpointing; OpenTelemetry | El framework completo para este tamaño; el SDK de Go en preview |
| [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) | MIT | Supervisor y swarm como patrones explícitos; ejecución durable; time travel | La complejidad de un grafo para un DAG de seis tareas |
| [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) | MIT | Configuración rol/tarea; crews y flows; prototipado rápido | Delegación autónoma sin puertas de aprobación |
| [openai/openai-agents-python](https://github.com/openai/openai-agents-python) | MIT | Handoffs, tracing, guardrails | Pasar el historial completo en cada handoff; infla el contexto |
| [anthropics/claude-agent-sdk-python](https://github.com/anthropics/claude-agent-sdk-python) | MIT | Orquestador-trabajador con contexto aislado y retorno resumido | El enfoque de agente de código, que no es el caso |
| [google/adk-python](https://github.com/google/adk-python) | Apache-2.0 | A2A, multilingüe, evaluación integrada | Acoplamiento a Google Cloud si el stack es Microsoft |
| [mastra-ai/mastra](https://github.com/mastra-ai/mastra) | Apache-2.0 (ee aparte) | Agentes, workflows y memoria en TypeScript | La parte enterprise, con licencia distinta |
| [pydantic/pydantic-ai](https://github.com/pydantic/pydantic-ai) | MIT | Salidas tipadas y ejecución durable | Python si el equipo va a quedarse en TypeScript |
| [FoundationAgents/MetaGPT](https://github.com/FoundationAgents/MetaGPT) | MIT | SOP, roles y artefactos encadenados | El dominio de generación de software |
| [alihdrndm/ledgic](https://github.com/alihdrndm/ledgic) | MIT | Facturación de proveedor: la IA lee, el código hace el three-way match y el humano resuelve la excepción; servidor MCP | La app completa y su stack Next.js/FastAPI |
| [a2aproject/A2A](https://github.com/a2aproject/A2A) | — | Agent Cards, ciclo de vida de tareas, streaming, autenticación | Evitar A2A en el MVP; el DAG propio basta |

Los repositorios visuales (Claude Office, Agent Office, Pixel Agents, Office 3D, AI Town) ya están inventariados en `01_INVESTIGACION/02_REFERENTES_Y_REPOSITORIOS.md`. La novedad de 2026 es que la oficina pixel art y 3D isométrica se ha convertido en un patrón saturado: además de `paperclipai/companies` (`companies.sh` con empresas agénticas preconfiguradas), han proliferado proyectos como `fwartner/clawd-office`, `WW-AI-Lab/openclaw-office`, `harishkotra/agent-office`, `Munder Difflin`, `AgentSystemLabs/agent-office`, `MitchellKevin/the-agentic-office` y `zep-us/zep-pixel-agents`. Ninguno es un foso defensivo por sí solo.

## 3. Tecnología de 2026

### 3.1 Protocolos: MCP, A2A y AG-UI (+ MCP Apps)

- **MCP (agente ↔ herramientas/datos):** conecta un agente con herramientas, datos y APIs bajo la Agentic AI Foundation (Linux Foundation). Es la capa que ya usan Copilot Studio, Foundry y la mayoría de frameworks.
- **A2A (agente ↔ agente):** la versión 1.0 se publicó en abril de 2026; supera las 150 organizaciones, absorbió variantes tempranas como ACP y reside en la Agentic AI Foundation (Linux Foundation). Usa *Agent Cards* y estados de tarea normalizados (`SUBMITTED`, `WORKING`, `INPUT_REQUIRED`, `COMPLETED`, `FAILED`).
- **AG-UI (agente ↔ interfaz de usuario) y MCP Apps:** la tercera pata estandarizada en 2026. **AG-UI** define un flujo ligero basado en eventos (~16 eventos como `TOOL_CALL_START`, `STATE_DELTA`) y el patrón **interrupt-and-resume** para *Human-in-the-Loop* en frontends propios (React/Vite). **MCP Apps** cubre el caso complementario: renderizar mini-apps interactivas en *sandbox* dentro de hosts externos.
- **Para el MVP:** no hace falta adoptar los SDK completos de MCP, A2A ni AG-UI; funciones TypeScript tipadas y nuestro contrato `07_CONTRATOS/event.schema.json` bastan. Pero diseñar las fronteras alineadas con el trío **MCP + A2A + AG-UI** permite evolucionar a producción sin reescribir la arquitectura.

### 3.2 Modelos

| Modelo | Fecha | Contexto | Precio (USD/M tokens) | Uso propuesto |
|---|---|---|---|---|
| GPT-6 Luna | 22/09/2026 | 1,1M | 0,10 / 0,50 | Código, diseño y tareas de alto volumen |
| GPT-6.1 Sol | 29/09/2026 | 1,05M | 2 / 10 | Dirección, arquitectura y trabajo profesional |
| GPT-6.1 Terra | 26/10/2026 | 1,05M | 1 / 5 | Especialistas rápidos, visión y computer use |
| GPT-6.2 Astra | 17/11/2026 | 1,05M | ~8–10 / 40–50 (verificar tenant) | Opción de máxima calidad si hay cuota |
| GPT-6.2 Sol | 17/11/2026 | 1,05M | ~2 / 10 (verificar tenant) | Alternativa directa a 6.1 Sol si el tenant ya la tiene GA |
| Claude Opus 5.5 | 22/09/2026 | 1M | 4 / 20 | Redacción y diseño; evaluar frente a Luna |
| Claude Fable 5.2 | 09/11/2026 | 1M | 8 / 40 | Razonamiento exigente; no necesario para la demo |
| Claude Sonnet 5.5 | 28/09/2026 | 1M | 2 / 10 | Alternativa económica |
| Claude Haiku 5.5 | 07/10/2026 | 1M | 0,10 / 0,50 | Clasificación y routing |

**Nota de nombres.** El compañero mencionó «Claude Opus 8». A 25/11/2026 no existe en el catálogo oficial: el último Opus es **5.5** (22/09/2026) y por encima está **Fable 5.2** (09/11/2026). Hay rumores de un Opus 5.6 sin ID ni ficha pública; no conviene ponerlo en una demo. GPT-6.2 Astra y Sol sí están GA desde el 17/11/2026, con Responses API, salidas estructuradas, uso de ordenador y orquestación multiagente en preview.

**Elección para el MVP.** GPT-6.1 Sol para el director y el arquitecto; GPT-6.1 Terra para los especialistas de alto volumen; GPT-6 Luna para código y diseño. GPT-6.2 Astra queda como opción si el tenant lo tiene y la evaluación justifica el coste. El adaptador de proveedor queda desde el primer día para poder cambiar sin tocar los prompts.

### 3.3 Patrones de orquestación

| Patrón | Cuándo usarlo | En Integra HQ |
|---|---|---|
| Supervisor / orquestador-trabajador | Un jefe decide quién actúa y lee cada resultado | Flujo A y B; es el patrón del director |
| Concurrente | Varias tareas independientes a la vez | CRM ∥ consultoría; consultoría ∥ arquitectura si el briefing alcanza |
| Secuencial | Una salida alimenta la siguiente | Arquitectura → ofertas → diseño |
| Handoff | Un agente transfiere el control a otro sin volver al jefe | No necesario; el director conserva el control |
| Magentic / grupo | Un manager elige al siguiente según el progreso | Demasiado abierto para una demo de 180 s |

La regla que se repite en las plataformas y frameworks de 2026: **los flujos críticos no se dejan al azar del modelo**. El director puede elegir el plan, pero la validación del DAG, los importes, las fechas y las puertas de aprobación son deterministas. La autonomía se reserva para lo que no compromete dinero ni reputación.

### 3.4 Comprar, integrar o construir

| Pieza | Decisión | Motivo |
|---|---|---|
| Runtime de agentes | Comprar / usar framework en producción | Foundry, Agent 365 y MAF ya resuelven identidad, trazas y hosting |
| Orquestador del MVP | Construir fino | Seis agentes y un DAG caben en TypeScript; un framework añade más superficie que valor |
| Herramientas de negocio | Construir adaptadores tipados | CRM, catálogo y facturación son el contexto propio de Integra |
| Agentes commodity (leads, pedidos, facturas) | Integrar | Microsoft ya los vende y los mantiene; reconstruirlos no diferencia |
| Oficina visual | Construir | Es la interfaz de marca y el gancho de la demo; no hay un producto que la dé hecha con la identidad de Integra |
| Gobierno y auditoría | Comprar en producción | Agent 365, Entra, Purview y Defender; en la demo, eventos y aprobaciones |

### 3.5 Regulación, seguridad y observabilidad en 2026 (España y UE)

- **EU AI Act (agosto de 2026) y AESIA:** desde agosto de 2026 son exigibles las obligaciones de transparencia del **Artículo 50** (informar de interacción con IA y marcar contenido sintético). En España, **AESIA** publicó **16 guías prácticas** sobre documentación técnica, gestión de riesgos y supervisión humana. Esto convierte nuestras guardas (etiqueta `BORRADOR`, modos visibles `LIVE/REPLAY/MOCK`, trazabilidad de fuentes y aprobación humana obligatoria) en un diferencial comercial real para clientes españoles.
- **OWASP Top 10 for Agentic Applications (ASI01–ASI10):** referencia estándar de riesgos operativos en sistemas multiagente (*ASI01 Goal Hijack*, *ASI02 Tool Misuse*, *ASI03 Identity & Privilege Abuse / least agency*, *ASI05 Unexpected Code Execution*, *ASI09 Human-Agent Trust Exploitation*).
- **OpenTelemetry GenAI Semantic Conventions:** estandariza trazas `invoke_agent` y `execute_tool` con captura *opt-in* para prompts y argumentos sensibles, respaldando nuestra regla de no guardar razonamiento privado ni datos confidenciales por defecto.

## 4. Señales de mercado y casos

- **Klarna:** un agente de atención al cliente equivalente a 853 personas y 60 M USD de ahorro anual, según la propia compañía. Es un claim corporativo, no una auditoría independiente.
- **BNY (Eliza):** más de 125 casos de uso y 20.000 empleados construyendo agentes, según un caso secundario. La escala es la señal: la adopción real pasa por una plataforma interna, no por un chat.
- **JPMorgan:** más de 450 casos de uso en producción, según el mismo tipo de fuente. Otra vez, la ventaja está en el proceso y el gobierno.
- **Shopify Sidekick:** asistente agéntico dentro del admin; útil como ejemplo de agente embebido en una herramienta de trabajo, no como chatbot aparte.
- **McKinsey (State of AI 2025):** 23 % de organizaciones escalando algún sistema agéntico, 39 % experimentando y menos del 10 % escalando agentes en una función concreta. La brecha entre demo y producción es el espacio donde una consultora puede aportar.
- **Microsoft (Work Trend Index 2026):** el «Frontier Firm» se describe como una organización dirigida por humanos y operada con agentes, con el ratio humano-agente como métrica de capacidad. Lo útil para Integra no es el término, sino el modelo operativo: cada agente tiene dueño, presupuesto, permisos y revisión.

La lectura para el hackathon: el jurado ya habrá visto chatbots y oficinas bonitas. Lo que no habrá visto es un flujo de Integra que termine en un entregable verificable y en una decisión humana.

## 5. Implicaciones para el reto

### Qué significa «funcional» aquí

1. Una petición real entra por la UI.
2. El director produce un plan distinto según la petición.
3. Los especialistas trabajan con datos y herramientas, no solo con prompt.
4. Salen artefactos que se pueden abrir y editar.
5. Cada estado de la oficina corresponde a un evento.
6. El humano aprueba lo que sale fuera.

Si falta cualquiera de los seis, es una demo de teatro.

### Ventajas de Integra

- Es partner de Microsoft y puede apoyarse en Foundry, Copilot Studio, Dynamics 365 y Business Central sin empezar de cero.
- Conoce el ciclo comercial y de entrega de una consultora: oportunidad, propuesta, proyecto, factura.
- Tiene marca, sede y una narrativa de 40 años que dan contexto a la oficina.
- Puede vender el resultado como una capacidad propia, no como un wrapper de OpenAI.

### Riesgos

| Riesgo | Mitigación |
|---|---|
| El LLM inventa precios o condiciones | Catálogo aprobado y renderer determinista; el LLM elige, no escribe importes |
| Se conectan datos reales sin permiso | Fixtures sintéticas y etiquetadas; producción solo con autorización |
| La oficina tapa un flujo vacío | Un flujo completo vale más que siete agentes a medias |
| Se copia Paperclip o OneManCompany | Se toman ideas de gobierno e interfaz; el código y el flujo son propios |
| La demo se pasa de tiempo | Dos tareas en paralelo, GPT-6.1 Terra y GPT-6 Luna, caché de prompts y ensayo real |
| Se promete autonomía que no existe | Etiquetas live/replay/mock y aprobación humana visible |

## 6. Recomendación

1. **Ocho agentes:** director, CRM, consultoría, arquitectura, ofertas, diseño, proyectos y facturación. Los dos últimos entran en la demo con pasos deterministas.
2. **Un flujo principal de ciclo completo** (señal → oferta → aprobación → proyecto → factura) y el flujo de solución puntual como segunda combinación. La intervención humana es P0.
3. **Datos sintéticos:** CRM, catálogo, proyectos, facturación y conocimiento. Sin conectores reales en el hackathon.
4. **DAG propio en TypeScript + checkpoint:** transparencia, pausa y reanudación. La salida a producción se diseña con MAF/Foundry y Agent 365, no se implementa ahora.
5. **Una sola cosa que impresione:** que el ciclo termine en una oferta DOCX/PDF, un plan de proyecto y un borrador de factura, con una decisión humana registrada.

### Siguiente investigación

1. ¿Qué catálogo de servicios y bandas de precio puede usar el equipo, aunque sea sintético y aprobado por negocio?
2. Confirmar que no hay tenant de Dynamics 365 o Business Central y que la demo va con fixtures.
3. ¿Hay deployment y cuota de GPT-6.1 Sol/Terra y GPT-6 Luna en la suscripción de Azure? ¿En qué región?
4. ¿Quiénes forman el jurado y qué valoran exactamente? La demo se asume de 180 s.
5. ¿Qué renderer gana el spike A/B/C? Sin eso, el esquema visual no se puede cerrar.

Se puede prototipar con fixtures; no cerrar la implementación de documentos hasta tener el catálogo y el deployment.

## 7. Fuentes

- [Paperclip](https://github.com/paperclipai/paperclip) — repositorio y README; 117k estrellas, MIT, consultado el 25/11/2026.
- [OneManCompany](https://github.com/1mancompany/OneManCompany) — repositorio y README; 474 estrellas, Apache-2.0, consultado el 25/11/2026.
- [Microsoft Agent Framework](https://learn.microsoft.com/en-us/agent-framework/) — documentación oficial; patrones de orquestación, checkpointing y human-in-the-loop; Python y .NET.
- [Microsoft Foundry · workflows](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/workflow) — workflows multiagente en preview, A2A, migración a Agent Framework.
- [Microsoft Agent 365](https://www.microsoft.com/en-us/microsoft-agent-365) — control plane; GA 01/05/2026, 15 USD/usuario/mes.
- [Microsoft 365 E7 y Agent 365 GA](https://techcommunity.microsoft.com/blog/microsoft_365blog/microsoft-365-e7-and-agent-365-are-now-generally-available/4516295) — precios y disponibilidad.
- [Copilot Studio · novedades](https://learn.microsoft.com/en-us/microsoft-copilot-studio/whats-new) — orquestación multiagente, agentes conectados y A2A.
- [Dynamics 365 Sales · Sales Qualification Agent](https://learn.microsoft.com/en-us/dynamics365/sales/sales-qualification-agent) — agente autónomo de cualificación.
- [Business Central · AI](https://learn.microsoft.com/en-us/dynamics365/business-central/ai-in-bc) — Sales Order Agent y Payables Agent.
- [Business Central · consumo](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/administration/tenant-admin-center-manage-consumption-billing) — Copilot Credits y ejemplos de coste.
- [Salesforce Agentforce · multiagente](https://www.salesforce.com/agentforce/multi-agent-orchestration/) — orquestador, agentes secundarios, A2A.
- [GPT-6.2 Astra y Sol](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/gpt-6-2-astra-and-gpt-6-2-sol-now-generally-available-in-microsoft-foundry/4574122) — GA 17/11/2026, contexto y precios.
- [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna) — 22/09/2026, 1,1M de contexto, 0,10/0,50 USD por millón.
- [GPT-6.1 Sol](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure) — 29/09/2026, 1,05M de contexto.
- [GPT-6.1 Terra](https://openai.com/index/introducing-gpt-6-1-terra/) — 26/10/2026, modelo rápido y eficiente.
- [Claude Opus 5.5](https://www.anthropic.com/claude-opus-5-5) — 22/09/2026, precios y contexto.
- [Claude · modelos](https://platform.claude.com/docs/en/models/overview) — Fable 5.2, Opus 5.5, Sonnet 5.5, Haiku 5.5.
- [A2A · Linux Foundation](https://www.linuxfoundation.org/press/a2a-protocol-surpasses-150-organizations-lands-in-major-cloud-platforms-and-sees-enterprise-production-use-in-first-year) — v1.0, 150+ organizaciones, abril de 2026.
- [McKinsey · State of AI 2025](https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai) — 23 % escalando, 39 % experimentando; dato secundario.
- [Microsoft · Work Trend Index 2026](https://www.microsoft.com/en-us/worklab/work-trend-index/agents-human-agency-and-the-opportunity-for-every-organization) — Frontier Firm y ratio humano-agente.
- [SAP Agent Ready en España](https://portalerp.com/es/noticia/sap-impulsa-desde-espana-una-iniciativa-para-acelerar-la-ia-agentica-empresarial) — Inetum, SEIDOR e Indra; señal de mercado local.

Los datos de estrellas y precios cambian; se han anotado en la fecha de revisión. Los casos de Klarna, BNY y JPMorgan son claims publicados por terceros y no se han auditado.
