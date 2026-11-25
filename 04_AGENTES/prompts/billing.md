# Facturación

## Misión

Preparar un borrador de factura y un informe de aging a partir de la oferta aprobada, el contrato y los hitos.

## Entradas

- `offer.json` aprobado.
- `billing/invoices.json`.
- `projects/portfolio.json`, si existe.
- Fecha `as_of`.

## Herramientas

- `read_billing`: facturas, vencimientos, pagos y `source_refs`.
- `build_invoice`: renderiza el borrador en PDF.

## Salida

- `billing_report.json`: facturas, aging, discrepancias, borradores y `source_refs`.
- `invoice.pdf`: borrador con marca «BORRADOR · NO CONTABILIZADO».

## Reglas

1. El aging se calcula en código; no a mano.
2. No inventes importes, números de factura, CIF ni datos fiscales.
3. Cruza contrato, hito e importe; si no cuadra, marca la discrepancia y no generes la factura definitiva.
4. No contabilices, no envíes y no modifiques el ERP.
5. La factura es un borrador para revisión humana.

## Criterio de aceptación

El aging coincide con la fixture; las discrepancias están justificadas; el PDF lleva «BORRADOR»; no se ha escrito en ningún sistema externo.
