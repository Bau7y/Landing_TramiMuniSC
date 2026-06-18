# TramiMuniSC

Landing page responsiva para un servicio de acompañamiento ciudadano en trámites municipales en San Carlos, Costa Rica. Proyecto desarrollado para el Laboratorio #1 del curso ISW-521 — Programación en Ambiente Web I, Universidad Técnica Nacional.

## Descripción del proyecto

TramiMuniSC es una iniciativa que facilita la gestión de trámites ante la Municipalidad de San Carlos sin que el contribuyente tenga que desplazarse a las oficinas municipales. El sitio presenta los servicios disponibles (exoneraciones, declaración de bienes inmuebles, consultas y otros trámites), explica el proceso de trabajo y ofrece un canal de contacto directo.

El proyecto está construido con **HTML5 semántico**, **CSS3 nativo** y **JavaScript nativo**, sin frameworks ni librerías externas, cumpliendo con los requerimientos técnicos del laboratorio: estructura semántica válida, diseño responsivo con Flexbox y Grid, accesibilidad WCAG 2.1 nivel A, y persistencia de datos con Web Storage.

## Arquitectura

El sitio sigue el patrón **MPA (Multi-Page Application)** estática: cada vista es un documento HTML independiente que comparte recursos comunes (estilos, scripts e imágenes) ubicados en una carpeta `assets/`.

```
lab01/
├── index.html
├── pages/
│   ├── exoneraciones.html
│   ├── declaraciones.html
│   ├── consultas.html
│   ├── otros.html
│   └── contacto.html
└── assets/
    ├── css/
    │   ├── styles.css
    │   ├── home.css
    │   ├── page.css
    │   └── contacto.css
    ├── js/
    │   ├── components.js
    │   ├── main.js
    │   └── form.js
    └── img/
```

`index.html` se mantiene en la raíz porque es el punto de entrada estándar que cualquier servidor web busca por defecto. Las subpáginas se agrupan en `pages/` para mantener limpia la raíz, y todo recurso de soporte (CSS, JS, imágenes) vive bajo `assets/`, separando contenido de soporte visual y funcional.

## HTML semántico

Cada página utiliza únicamente etiquetas semánticas de HTML5: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>` y `<footer>`, según corresponde a la estructura real del contenido — no de forma decorativa.

- `<header>` y `<footer>` se generan dinámicamente mediante Web Components (`<nav-bar>` y `<site-footer>`), evitando así reescribir manualmente el mismo código en cada documento.
- `<main>` envuelve el contenido único de cada página y nunca se repite ni anida.
- `<section>` agrupa contenido temáticamente relacionado, cada una con `aria-labelledby` apuntando al `id` de su título.
- `<article>` se usa en cada card de servicio, cada paso del proceso y cada bloque de contenido autocontenido.
- `<aside>` aparece únicamente en las subpáginas, donde existe contenido lateral genuino (panel de contacto rápido). No se usa en el index porque ahí no hay contenido lateral real — agregarlo habría sido semántica decorativa.
- `<ol>` se usa para los pasos del proceso porque el orden importa; `<ul>` para listas donde el orden es indistinto.

Todo el código cumple con el estándar W3C, validado en `validator.w3.org`, y no utiliza tablas HTML para definir layout.

## Accesibilidad (WCAG 2.1 — Nivel A)

- Atributos ARIA (`role`, `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-current`, `aria-expanded`, `aria-live`, `aria-invalid`) aplicados según corresponde a cada elemento interactivo.
- Todas las imágenes cuentan con `alt` descriptivo funcional; los elementos puramente decorativos usan `aria-hidden="true"`.
- El contraste entre texto y fondo cumple la relación mínima de 4.5:1 tanto en modo claro como en modo oscuro.
- Navegación completa por teclado, con `:focus-visible` definiendo un indicador de foco visible y diferenciado del estado `:hover`.

## CSS — Sistema de archivos

El proyecto usa un sistema de capas para evitar duplicar estilos entre las cuatro subpáginas que comparten estructura:

| Archivo | Se carga en | Contenido |
|---|---|---|
| `styles.css` | Todas las páginas | Variables CSS, reset, tipografía global, navbar, footer, botones y utilidades — el sistema de diseño base |
| `home.css` | Solo `index.html` | Hero, blob animado, grid de pasos, grid de servicios, sección CTA |
| `page.css` | Las 4 subpáginas (exoneraciones, declaraciones, consultas, otros) | Hero de subpágina, breadcrumb, layout de 2 columnas, requisitos, pasos del trámite, aside |
| `contacto.css` | Solo `contacto.html` | Formulario, estados de error, feedback de envío, aside de información de contacto |

Cada archivo tiene una única responsabilidad — el mismo principio de separación de responsabilidades aplicado a CSS en lugar de a código de programación.

### Variables CSS (`:root`)

Todo el sistema visual (colores, espaciado, tipografía, radios, transiciones) está centralizado en variables CSS dentro de `:root`. El modo oscuro se activa mediante el atributo `[data-theme="dark"]` en el `<html>`, que sobreescribe únicamente las variables de color — el resto del CSS no necesita duplicarse porque ya consume esas variables.

### Unidades de medida

- **`rem`** para tipografía y espaciado: es relativo al tamaño de fuente base del documento, por lo que respeta la configuración de accesibilidad del usuario.
- **`px`** para valores fijos no relacionados con texto, como la altura del navbar o radios de borde pequeños.
- **`vw` / `vh`** combinadas con `clamp()` para tipografía fluida que crece proporcionalmente al viewport sin necesitar múltiples `@media`.
- **`fr`** dentro de `grid-template-columns` para distribuir el espacio disponible proporcionalmente entre columnas.

### Box model

Todo el proyecto usa `box-sizing: border-box` en el reset global, de forma que el padding y el borde se incluyen dentro del ancho declarado de cada elemento, haciendo el layout predecible.

### Flexbox y Grid

- **Flexbox** se usa para layouts unidimensionales: navbar, menú móvil, listas de footer, contenido del hero, botones y cualquier agrupación de elementos en una sola fila o columna.
- **CSS Grid** se usa para layouts bidimensionales con estructura de cuadrícula: grid de pasos del proceso, grid de cards de servicios, grid del footer y el layout de contenido + aside en las subpáginas.

### Viewports y breakpoints implementados

El proyecto sigue un enfoque **mobile-first**: los estilos base (sin `@media`) están pensados para móvil, y los breakpoints agregan complejidad progresivamente.

| Breakpoint | Valor | Qué cambia |
|---|---|---|
| Base (móvil) | sin `@media` | Navbar con menú hamburger, columnas únicas en todos los grids, footer apilado |
| Tablet | `@media (min-width: 768px)` | Navbar muestra links horizontales, grids pasan a 2 columnas, footer a 3 columnas, aside aparece al lado del contenido |
| Desktop | `@media (min-width: 1024px)` | Grids pasan a 4 columnas, footer a 4 columnas, aumenta el padding del contenedor |

## JavaScript — Estructura y propósito de cada archivo

Todo el JavaScript es nativo, sin librerías ni frameworks externos.

### `components.js`

Define dos **Web Components** (estándar W3C nativo): `<nav-bar>` y `<site-footer>`. Cumplen la misma función que el `layout.tsx` de un framework como Next.js: centralizan el header y footer en un solo lugar, evitando reescribirlos manualmente en cada archivo HTML.

- **`NavBar`**: renderiza el navbar completo (logo, links, botón de tema, CTA, menú hamburger) en su método `connectedCallback()`, que se ejecuta automáticamente cuando el elemento `<nav-bar>` es insertado en el DOM. Internamente delega su comportamiento en tres métodos separados, cada uno con responsabilidad única:
  - `_initScrollEffect()`: agrega sombra al navbar cuando el usuario hace scroll.
  - `_initMobileMenu()`: controla apertura, cierre por click en link y cierre por click fuera del menú móvil.
  - `_initActiveLink()`: marca como activo el link correspondiente a la página actual, comparando `window.location.pathname` contra el `href` de cada link.

- **`SiteFooter`**: renderiza el footer completo, incluyendo el año de copyright generado dinámicamente con `new Date().getFullYear()`.

Ambas clases extienden `HTMLElement` y se registran al final del archivo con `customElements.define()`.

### `main.js`

Controla el **modo oscuro** y su persistencia con `localStorage`.

- Aplica el tema guardado **antes** de que el DOM termine de cargar, evitando el parpadeo visual de cambiar de claro a oscuro después de pintar la página.
- Si no hay tema guardado, respeta la preferencia del sistema operativo del usuario mediante `prefers-color-scheme`.
- Al hacer click en el botón de tema, alterna entre claro y oscuro, actualiza el ícono, guarda la preferencia en `localStorage` y actualiza el atributo `aria-pressed` para accesibilidad.
- Si el usuario cambia la preferencia de su sistema mientras la página está abierta, se actualiza automáticamente solo si no existe una preferencia manual guardada.

### `form.js`

Controla la lógica del formulario de contacto.

- Persiste el nombre ingresado en `localStorage` en tiempo real, y lo recupera automáticamente al recargar la página.
- Valida los campos del formulario (nombre, correo, asunto, mensaje) antes de procesar el envío, mostrando mensajes de error accesibles con `role="alert"`.
- Al enviar el formulario válido, construye una URL `mailto:` con los datos codificados mediante `encodeURIComponent()` y abre el cliente de correo del usuario con los campos prellenados.

## Web Storage

El proyecto implementa dos casos de uso de `localStorage`:

1. **Preferencia de tema** (claro/oscuro), gestionada en `main.js`.
2. **Nombre del formulario de contacto**, gestionado en `form.js`.

Ambos datos persisten entre sesiones y se recuperan correctamente al recargar la página, demostrando persistencia real tal como exige el laboratorio.

## Tecnologías utilizadas

- HTML5 semántico
- CSS3 nativo (variables, Flexbox, Grid, media queries, animaciones, `clamp()`, `calc()`)
- JavaScript nativo (Web Components, Web Storage API, manipulación del DOM, expresiones regulares)
- Sin frameworks ni librerías externas