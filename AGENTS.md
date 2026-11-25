# Instrucciones de trabajo para agentes de programación

Este repositorio es un dossier previo a la implementación. Empieza por README, `00_PROYECTO/02_ALCANCE_MVP.md` y `03_TECNICA/01_ARQUITECTURA.md`. No construyas todas las alternativas. Primero valida el renderer con un escritorio; después implementa uno solo.

- Trabaja en incrementos pequeños, commits revisables y sin cambios de alcance implícitos.
- El frontend nunca llama directamente a proveedores de LLM ni contiene secretos.
- Separa ejecución real, fixtures sintéticos y replay. Nunca muestres un éxito inventado en live.
- Todo evento tiene identificador de proyecto, secuencia monotónica y timestamp; estados terminales explícitos. Renderers consumen estado, no mensajes privados del modelo.
- Valida JSON de planificación, referencias, DAG y salidas. No ejecutar código arbitrario producido por LLM.
- No introducir assets de pago. Registrar origen, versión, licencia y modificaciones antes de copiar recursos al repositorio. No usar fan art excluido de licencias.
- Usa datos ficticios y fuentes públicas; documentos internos solo con permiso. No enviar correo real sin intervención humana.
- Mantener accesibilidad y legibilidad en proyección. Evitar gradients decorativos, exceso de tarjetas, texto pequeño y animaciones sin significado.
- No crear servicios cloud sin autorización. Ejecutar primero localmente. No inventar endpoints ni modelos desplegados.
- Antes de cerrar una tarea: comprobar pruebas, indicar cambios, errores y qué no se ha validado.

Prioridad: flujo vertical funcional → arte seleccionado → integración → demo. Consulta `05_DESARROLLO/01_PLAN.md` para criterios de aceptación.
