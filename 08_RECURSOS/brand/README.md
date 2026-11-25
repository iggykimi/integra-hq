# Kit de marca · Integra HQ

> Extraído de material corporativo oficial para el hackathon. **No es un manual de marca** ni un producto aprobado por Marketing. Fecha: 25/11/2026.

## Qué contiene

| Archivo | Uso |
|---|---|
| `logo-integra-color.svg` | Logo oficial en color, para fondos claros. |
| `logo-integra-blanco.svg` | Logo oficial en blanco, para fondos oscuros. |
| `logo-integra-gris.svg` | Logo monocromo oficial, para una sola tinta. |
| `brand-tokens.json` | Colores, tipografía, tamaños y reglas de layout en formato reutilizable. |
| `brand.css` | Variables CSS y componentes base (portada, diapositiva, estadísticas, fichas de agente). |
| `brand-preview.html` | Muestra visual de portada y diapositiva interior. Se abre en el navegador, sin instalar nada. |
| `brand-preview.png` | Captura de la muestra. La fuente editable es el HTML; la captura puede quedar desactualizada si cambia el CSS. |

La captura se renderizó con la pila de reserva (Causten no está instalada en este equipo); con la fuente corporativa, el titular cambia de forma. La estructura y los colores son los mismos.

## Fuente

- **Logo:** sala de prensa oficial de Integra, `https://www.integratecnologia.es/sala-de-prensa-logos`. Se han usado los SVG originales; no se han redibujado.
- **Color y layout:** presentación corporativa `Integra_Data&AI General 1.pptx` (20/11/2025) y una propuesta técnica interna (10/09/2026), usada solo como referencia de layout. Los archivos originales **no se incluyen** en este repositorio.
- **Tipografía:** la presentación usa la familia **Causten** (Light, Regular, Medium, Semi Bold, Bold, Extra Bold, Black). Es una fuente licenciada; no se distribuye el archivo.

## Paleta

Los colores exactos varían ligeramente entre presentaciones. Esta es la base recomendada para el producto:

| Token | Hex | Uso |
|---|---|---|
| `logo-blue` | `#1D71B8` | Inicio del gradiente del logo; enlaces y acentos sobrios. |
| `logo-teal` | `#5FB3BC` | Centro del gradiente; apoyo. |
| `logo-mint` | `#70C4BE` | Final del gradiente; detalles. |
| `cyan` | `#00B0F0` | Acento principal, marcos y datos. |
| `cyan-bright` | `#43C6F0` | Titulares y elementos sobre fondo oscuro. |
| `navy` | `#0B2A5B` | Fondo de portada y texto principal. |
| `blue-deep` | `#115293` | Titulares y bloques oscuros. |
| `blue-bright` | `#1368DE` | Enlaces y acentos. |
| `purple` | `#7030A0` | Bloques de estadísticas y contraste. |
| `pink` | `#D70A8A` | Acento puntual; no usar como color dominante. |
| `gray` | `#3C3C3B` | Logo monocromo. |
| `line` | `#E8E8E8` | Bordes y separadores. |

**Regla práctica:** fondo blanco o azul marino; un solo acento cian por pantalla; el morado y el rosa se reservan para datos o estados, no para decorar.

## Tipografía

- **Oficial:** Causten. Si está instalada, úsala con moderación: Light para entradillas, Medium/Regular para cuerpo, Bold/Extra Bold para titulares.
- **Sustitutas libres:** Poppins o Montserrat (SIL Open Font License). Son las que usa la previsualización si Causten no está disponible.
- **No incluir** archivos `.ttf`/`.otf` de Causten en el repositorio sin licencia escrita.
- **Tamaños de referencia:** portada 46–56 px; titular de sección 28–36 px; cuerpo 14–18 px; pie 12–16 px. En una diapositiva de 1600×900, el titular no baja de 36 px.

## Layout

- Formato 16:9; referencia 13,333 × 7,5 in (1600×900 px).
- **Portada:** fondo azul marino/cian con degradado, logo blanco arriba a la izquierda, antetítulo, titular grande y pie con la web.
- **Interior:** fondo blanco; titular a la izquierda con marco cian de 3–4 px; datos o gráficos a la derecha; pie con logo en color, web y número de diapositiva.
- **Márgenes:** 6–7 % del ancho; nada importante a menos de 48 px del borde.
- **Contraste:** texto blanco sobre azul marino o cian oscuro; texto azul marino sobre blanco. Evitar gris claro sobre blanco para texto pequeño.
- **Iconografía:** línea fina, cian o blanca, sobre cuadros azul marino. No reutilizar los iconos propietarios de la presentación; usar un set libre (Lucide, Phosphor) con el mismo grosor.

## Uso y permisos

- El logo es una marca registrada. El permiso para usar el logo y la marca en el hackathon está confirmado; **no implica** que el proyecto sea un producto oficial de Integra.
- Para una presentación externa, una campaña o un producto, confirmar de nuevo con Marketing: uso del logo, textos, cifras y la frase «Integra HQ».
- No alterar proporciones, colores ni orientación del logo. No recrearlo con una fuente.
- Atribución recomendada en el README del proyecto: «Logo y referencias de marca de Integra Tecnología, usados con permiso para el hackathon. No es un producto oficial.»

## Qué no se ha copiado

- La presentación corporativa completa y sus fotos de stock.
- Los logos de Microsoft, IBM, Ibercaja y otros partners.
- Los iconos de servicio y las ilustraciones propietarias.
- Nombres de clientes, importes, códigos de propuesta o textos legales internos.
- La fuente Causten.

## Pendiente

1. Mantener la nota de «no producto oficial» en el README y en la demo.
2. Decidir si se usa Causten (con licencia web) o Poppins/Montserrat en la demo.
3. Validar las cifras de la muestra (40 años, 800+ personas, 6 designaciones, 2029) con la fuente interna más reciente.
4. Si se quiere una plantilla PPTX oficial, pedir la versión aprobada en lugar de reconstruirla.
