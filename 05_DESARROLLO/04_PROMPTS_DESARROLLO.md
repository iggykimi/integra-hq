# Prompts de trabajo para Claude Code / Codex

## 1. Spike gráfico

Lee README, alcance, dirección artística y pipelines. Construye únicamente una microescena comparativa de un escritorio, dos monitores, una planta y un personaje. Usa recursos gratuitos de assets.csv cuya licencia hayas comprobado. No inventes enlaces ni descargues paquetes de pago. Si no puedes descargar, deja una instrucción manual y utiliza un placeholder claramente marcado. Implementa idle/working/done desde el fixture compartido. Mide carga, fluidez, esfuerzo y legibilidad. No desarrolles aún toda la oficina. Entrega capturas, código y decisión justificada.

## 2. Backend vertical

Lee contratos, prompts y arquitectura. Implementa API con provider mock y adaptador real configurable. Valida DAG, dependencias, límites y esquemas. No hardcodees el plan live. Ejecuta tareas ready en paralelo y emite eventos ordenados persistidos. No exponer razonamiento, secretos ni datos privados. Implementa pruebas de error, dependencia y idempotencia. No desplegar ni usar credenciales sin autorización.

## 3. Documentos

Genera un SVG desde arquitectura estructurada y un PPTX con PptxGenJS a partir de slides validadas. Usa diseño profesional 16:9, máximo seis slides y logo oficial solo si se ha incorporado autorizado. Escapa texto, evita desbordamientos y no inventes información. Abre el archivo para comprobarlo. Emite artifact.created después de guardarlo. No usar código generado por el modelo como ejecutable.

## 4. Integración UI

Integra el renderer elegido y el reducer. Estado derivado de eventos del backend, no temporizadores falsos. Mantén inspector, panel de proyecto y descarga. Modo live/mock/replay visible. Proyección 1080p, teclado, reduced motion. Evita añadir un motor o librería si no aporta valor. Prueba recarga y errores.

## 5. Revisión final

Contrasta con todos los criterios P0 y guion. Ejecuta pruebas reales; comprueba archivos, permisos, licencias y secret scanning. Enumera hechos comprobados, no comprobados, fallos y decisiones. Prepara un replay de una ejecución real y su evidencia, separado del fixture sintético. No informes de despliegue si no existe.
