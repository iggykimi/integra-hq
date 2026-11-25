# Contratos preliminares

Esquemas JSON Schema Draft 2020-12 de aplicación. Adaptar a subconjunto de Structured Outputs admitido por el proveedor; el backend siempre valida independientemente. No basta con JSON Schema para detectar ciclos, IDs duplicados, referencias de nodos o agentes, permisos, ni límites de concurrencia: implementar validación semántica adicional. Los fixtures son sintéticos y no constituyen archivos generados realmente. `types.ts` es contrato inicial, no SDK compilado. No contiene claves.

El contrato nuevo incluye 8 agentes, `requiresApproval` en la tarea de oferta, `human.message`, `run.paused` y `run.resumed`. `fixtures/plan.json` refleja el ciclo completo. `fixtures/events.mock.json` es el mock histórico de cuatro agentes y se regenerará al implementar la pausa y la reanudación.
