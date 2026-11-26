# Prompts de trabajo para Claude Code / Codex

## 1. Spike gráfico

Lee README, alcance, dirección artística y pipelines. Construye únicamente una microescena comparativa de un escritorio, dos monitores, una planta y un personaje. Usa recursos gratuitos de assets.csv cuya licencia hayas comprobado. No inventes enlaces ni descargues paquetes de pago. Si no puedes descargar, deja una instrucción manual y utiliza un placeholder claramente marcado. Implementa idle/working/done desde el fixture compartido. Mide carga, fluidez, esfuerzo y legibilidad. No desarrolles aún toda la oficina. Entrega capturas, código y decisión justificada.

## 2. Backend vertical

Lee contratos (`07_CONTRATOS/`), prompts (`04_AGENTES/prompts/`) y arquitectura (`03_TECNICA/01_ARQUITECTURA.md`). Implementa API Fastify con provider mock y adaptador real configurable para los 8 roles (`director`, `crm`, `consultant`, `architect`, `offers`, `designer`, `delivery`, `billing`). Valida DAG acíclico (máx. 8 tareas), dependencias, límites de concurrencia (máx. 2) y esquemas de salida. No hardcodees el plan live. Implementa pregunta humana de alcance (`human.message`), checkpoint persistente con pausa (`approval.required` + `run.paused`) y reanudación sin repetir tareas (`approval.resolved` + `run.resumed`), con máximo 1 replanificación ante corrección. Permite que `delivery` y `billing` sean deterministas. No exponer razonamiento privado, secretos ni datos reales. Implementa pruebas de error, dependencia, pausa/reanudación e idempotencia. No desplegar ni usar credenciales sin autorización.

## 3. Documentos

Genera de forma determinista desde JSON validado: oferta (`offer.docx` + `offer.pdf`, con marca «BORRADOR» y precios estrictamente desde `catalog/services.json`), plan de proyecto (`project_plan.pdf`), borrador de factura (`invoice.pdf`, marcado «BORRADOR · NO CONTABILIZADO»), diagrama SVG sanitizado desde `architecture.json` y presentación PPTX 16:9 (máx. 6 diapositivas) con PptxGenJS desde `slides.json`. Genera DOCX y PDF directamente desde el JSON validado sin depender de LibreOffice en contenedor. Usa el kit de marca de `08_RECURSOS/brand/` solo según permisos registrados. Escapa texto, evita desbordamientos y no inventes cifras. Comprueba apertura real de los archivos. Emite `artifact.created` solo tras guardar con checksum. No ejecutar código generado por el modelo.

## 4. Integración UI

Integra el renderer elegido (5 zonas, 8 roles) y el reducer compartido. Estado derivado exclusivamente de snapshot + eventos del backend, sin temporizadores falsos. Incluye panel de pregunta humana y aprobación/corrección de oferta, inspector de agente (tareas, herramientas, fuentes, artefactos) y descarga de documentos. Modo `LIVE / MOCK / REPLAY` siempre visible. Proyección 1080p, navegación por teclado y `reduced-motion`. Evita añadir un motor o librería si no aporta valor. Prueba recarga, pausa por aprobación y errores.

## 5. Revisión final

Contrasta con todos los criterios P0 y guion. Ejecuta pruebas reales; comprueba archivos, permisos, licencias y secret scanning. Enumera hechos comprobados, no comprobados, fallos y decisiones. Prepara un replay de una ejecución real y su evidencia, separado del fixture sintético. No informes de despliegue si no existe.
