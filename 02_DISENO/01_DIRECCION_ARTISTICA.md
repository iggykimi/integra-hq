# Dirección artística: Integra HQ, 2029

## Estilo

Pixel art arquitectónico contemporáneo o diorama 3D estilizado. Luz natural, materiales cálidos, blancos, roble y azul de marca; terracota y vegetación como inspiración DAT Alierta. Personajes de consultora tecnológica, ropa business casual, variedad de tonos de piel, peinados y accesorios. Evitar futurismo neón, robots genéricos, degradados morados, glassmorphism indiscriminado, personajes desproporcionados y exceso de decoración. La oficina debe parecer vivida y profesional.

## Identidad

Usar el SVG oficial en cabecera y señalética. No pedir al generador de imágenes que escriba el logo. «HQ» es una extensión tipográfica separada, no rediseño oficial. El kit de marca está en `08_RECURSOS/brand/` (logos, tokens y muestra visual). La presentación corporativa confirma la familia **Causten** y la paleta cian/azul marino; falta la confirmación de Marketing para publicar.

### Capa de producto (UI, documentos, presentaciones)

| Uso | HEX |
|---|---|
| Cian | `#00B0F0` |
| Cian claro | `#43C6F0` |
| Azul marino | `#0B2A5B` |
| Azul profundo | `#115293` |
| Morado | `#7030A0` |
| Rosa | `#D70A8A` |
| Blanco | `#FFFFFF` |
| Gris de línea | `#E8E8E8` |
| Texto | `#0B1B2B` |
| Texto secundario | `#5B6B7C` |

Tipografía: **Causten** (oficial, licenciada; no incluir el archivo). Sustitutas libres: Poppins o Montserrat (OFL) para la demo; IBM Plex Mono para datos y código. Los estados deben incluir texto/icono, no solo color. Contraste y foco accesibles.

### Capa de oficina (ambiente)

La paleta material se mantiene: roble `#D7C2A3`, cerámica `#B78770`, cristal `#A9C3CC`, vegetación `#748E69`. No usar el cian de marca en paredes o muebles: se reserva para pantallas, señalética y UI. La oficina no debe parecer una diapositiva corporativa.

### Estados (provisional, no marca)

| Estado | HEX |
|---|---|
| Disponible | `#929CA5` |
| Trabajando | `#168DC5` |
| Pendiente | `#D5A13D` |
| Completado | `#36966C` |
| Error | `#C94F50` |

## Distribución de oficina

Una unidad de trabajo, no plano de sede. Cinco zonas: dirección con pizarra; comercial con pipeline; soluciones con pizarra técnica; comunicación con pantalla de diapositivas; operación con plan de proyecto y factura. Recepción con sobre y logo; mesa de reuniones; ventana y café. Cámara fija de tres cuartos, estaciones distinguibles, espacio negativo para etiquetas; evitar objetos que tapen personajes. Para 2D usar rejilla dimétrica 2:1 (64×32 tile como candidato), no mezclar sprites 3/4 top-down incompatibles. Para 3D cámara ortográfica con yaw ~45°, elevación ~30° para aproximar 2:1; ajustar por composición. No confundir proyección dimétrica de pixel art con isometría matemática exacta.

## Assets mínimos

1 escena; 8 personajes (o 6 + 2 reutilizados) con idle, working, waiting, done/blocked; 8 retratos opcionales; 3 efectos (sobre, enlace, documento); logo vectorial oficial autorizado; una fachada opcional; PC retro opcional. Evitar sprites de más direcciones de las necesarias. Si el rigging consume demasiado, exportar un personaje animado o usar poses fijas coherentes con monitores y estados.

## Brief de ilustración (fallback)

Ilustración panorámica de oficina tecnológica española, corte arquitectónico, paredes delanteras retiradas, grandes ventanales con celosías terracota, roble claro, escritorios blancos, pantallas negras, mamparas de cristal, vegetación. Cinco zonas distinguibles (Dirección, Comercial, Soluciones, Comunicación y Operación), recepción, reunión y café. Perspectiva dimétrica 2:1, luz de día, paleta consistente, estilo videojuego independiente de alta calidad. Sin personajes, textos, logos generados, interfaz ni botones. Espacio para overlays y personajes; exportar fondo y oclusiones por separado. La escena no es una recreación oficial del edificio.

## Animaciones

| Evento | Representación |
|---|---|
| request.received | Sobre en recepción, indicador textual. |
| plan.created | Pizarra muestra plan real. |
| task.assigned | Pulso breve del director al agente. |
| task.started | Monitor encendido, typing/lectura. |
| tool.completed | Actualización de actividad y fuente/artefacto. |
| artifact.created | Aparece documento seleccionable. |
| human.message | Panel de conversación; el director espera la respuesta. |
| run.paused / run.resumed | La oficina queda en espera; al reanudar, el agente vuelve a su zona. |
| task.failed / approval.required | Aviso y estado, nunca éxito. |
| project.completed | Entregables y resultado visible. |

Animación ambiental local (idle) no implica ejecución de LLM. Reduced motion reduce desplazamientos; los eventos y los estados siguen visibles.
