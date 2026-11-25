# Referentes y repositorios

## Priorización de investigación práctica

| Repositorio / demo | Aprendizaje concreto | Reutilización |
|---|---|---|
| [Claude Office](https://github.com/W17ant/Claude-Office) | React/Vite, eventos de hooks, inspector, estados, modo sim/replay, arte isométrico. | MIT para código; fan art Dunder Mifflin excluido. Revisar NOTICE. No instalar hooks en equipos corporativos sin permiso. |
| [Agent Office](https://github.com/whoamnesia/agent-office) | PixiJS, estados, sprites procedurales, protocolos, ambientación, tests y replay. | MIT según README; sus métricas GPU no verificadas. Tomar módulos concretos, no toda la ciudad. |
| [Pixel Agents](https://github.com/pixel-agents-hq/pixel-agents) | Sprites, mobiliario, conversión de actividad en animación y extensibilidad. | MIT código; revisar derechos de cada gráfico. |
| [Office 3D Experience](https://github.com/psandis/office-3d-exp) / [demo](https://psandis.github.io/office-3d-exp/) | React Three Fiber, personaje sentado, typing, cámara, interacciones. | Verificar licencia y modelos antes de copiar; inspiración primero. |
| [AI Town](https://github.com/a16z-infra/ai-town) | Simulación, estado de mundo, separación entre lógica y vista. | MIT código. No necesitamos su simulación autónoma. |
| [ChatDev](https://github.com/OpenBMB/ChatDev) | Empresa multiagente y roles especializados. | Patrón conceptual; no reutilizar un backend completo. |
| [Pixel Office](https://github.com/gonzalonicolasr/pixel-office) | Candidato previo: rendering 2.5D y coordinación de agentes. | Revalidar README/licencia y API antes de adoptar. |
| [Pixel Hotel](https://github.com/romebkkk/pixel-hotel) | Candidato previo: mapa isométrico, posiciones y movimiento. | Revalidar disponibilidad/licencia; no copiar Habbo. |
| [Pixel Office (adaptación)](https://github.com/fedevgonzalez/pixel-office) | Alternativa independiente a Pixel Agents. | Candidato previo, pendiente ejecución y licencia. |
| [Isometric Agent Office](https://github.com/hr1d0y/isometric-agent-office) | Candidato previo 3D. | Pendiente revalidar. |
| [AI Office](https://github.com/abrahamjish1222-hash/ai-office) | Candidato previo React/Three.js. | Pendiente revalidar. |
| [Agent Office 3D](https://github.com/ignitrondev/agent-office) | Candidato previo animación y colaboración. | Pendiente revalidar. |
| [Lenny's Agent Office](https://github.com/blakeschafer/agent-office) | Candidato previo PixiJS/eventos. | Pendiente revalidar. |
| [The Office](https://github.com/ashawareb/the-office) | Candidato previo Phaser/React. | Pendiente revalidar. |
| [My Virtual Office](https://github.com/eliautobot/my-virtual-office) | Candidato previo diorama. | Pendiente revalidar. |
| [Habblaud](https://github.com/marmottajr/habblaud) | Candidato previo interacción social. | Pendiente revalidar. |

La revisión actual confirmó fuentes de Claude Office, Agent Office, licencia de Pixel Agents y AI Town, y la demo/README de Office 3D Experience. Los demás se conservan como referencias de exploración anterior y no como repositorios instalados ni validados. No afirmar benchmarks o compatibilidad no probados.

## Inspiración artística (no recursos redistribuibles)

Habbo Hotel: perspectiva 2:1, escala humana, mobiliario modular. eBoy: densidad de detalle y arquitectura pixel art. Unpacking: coherencia de objetos cotidianos. Project Highrise y Two Point Campus: legibilidad funcional y humor ambiental. The Sims original: asociación entre acciones y objetos. Octopath Traveler: contraste entre personajes pixel art y espacio 3D iluminado. Usar principios, no copiar sprites, marcas ni capturas como assets del producto.

## Literatura de agentes y diseño

- [Anthropic — Building effective agents](https://www.anthropic.com/research/building-effective-agents): routing, paralelización, orquestador-trabajadores y evaluación. Justifica un plan dinámico de bajo coste estructural.
- [Generative Agents, Park et al. (2023)](https://arxiv.org/abs/2304.03442): mundo virtual y comportamiento de agentes. Aquí no necesitamos memoria social ni reflexión prolongada.
- [OpenAI Agents SDK](https://developers.openai.com/api/docs/guides/agents/sdk): herramientas, delegación, trazas y supervisión.
- [Microsoft Agent Framework](https://github.com/microsoft/agent-framework): workflows y patrones de orquestación; estudiar Magentic si la coordinación se hace más compleja.
- [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview): persistencia/grafos; excesivo para el MVP si el DAG propio funciona.
- [MCP](https://modelcontextprotocol.io/): integración de herramientas cuando la necesidad lo justifique.
