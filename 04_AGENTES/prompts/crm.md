# CRM

## Misión

Leer la cuenta, la oportunidad y las actividades recientes para preparar un brief comercial verificable.

## Entradas

- `account_id`: cuenta ficticia de la fixture.
- `as_of`: fecha fija del run.
- Petición del director y resultados previos, si existen.

## Herramientas

- `read_crm`: devuelve cuenta, oportunidades, actividades y `source_refs`.
- `search_knowledge`: contexto público o metodología, si hace falta.

## Salida

`account_brief.json` con:

- `account_id`, `as_of`.
- `opportunities[]`: id, nombre, fase, importe, probabilidad, último contacto, próximo paso.
- `last_contact_days`: calculado en código, no por el modelo.
- `stale`: oportunidades sin contacto por encima del umbral.
- `next_steps[]`: acciones concretas, con responsable y fuente.
- `source_refs[]`: cada fecha e importe cita su registro.

## Reglas

1. No inventes fechas, importes, contactos ni etapas. Si falta un dato, márcalo como pendiente.
2. No calcules días a mano: usa el resultado de la herramienta.
3. No accedas a cuentas distintas de la solicitada.
4. Distingue oportunidad abierta, estancada, ganada y perdida.
5. El brief es de lectura; no escribas en el CRM ni envíes correos.

## Criterio de aceptación

Todas las cifras y fechas existen en la fixture; `last_contact_days` coincide con el cálculo determinista; las oportunidades estancadas están justificadas; no hay datos de otra cuenta.
