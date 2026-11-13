# TramiMuniSC

Landing page para un servicio de acompañamiento en trámites ante la Municipalidad de San Carlos, Costa Rica. Nació como Laboratorio #1 de ISW-521 (Programación en Ambiente Web I, UTN) en HTML, CSS y JS nativos. La versión 2 migra a **Astro** para reutilizar componentes, escalar contenido y enviar el formulario de contacto desde el servidor.

## Stack

| Capa | Tecnología | Rol |
|---|---|---|
| Framework | Astro 7 | Genera HTML estático; solo la acción de contacto corre en el servidor |
| Estilos | CSS nativo con variables (`snake_case`) | `global.css` con tokens y estilos con alcance por componente; clases en `snake_case` |
| Interactividad | TypeScript nativo en `<script>` | Tema, idioma, menú móvil, animaciones y formulario. Sin librerías de UI |
| Idiomas | i18n de Astro (`es` sin prefijo, `en` en `/en/...`) | Textos de interfaz en `src/i18n/ui.ts`; contenido de servicios por idioma |
| Animaciones | CSS + `IntersectionObserver` | Aparición al hacer scroll (`data-reveal`), curvas propias; se desactivan con *reducir movimiento* |
| Contenido | Content Collections (Markdown + Zod) | Un archivo `.md` por servicio |
| Backend | Astro Actions + Zod | Validación tipada del formulario en el servidor |
| Correo | Resend | Envío transaccional (gratis hasta 3 000 correos al mes y 100 al día) |
| Deploy | Vercel (`@astrojs/vercel`) | Páginas estáticas en CDN y la acción como función serverless |
| Fuentes | `@fontsource-variable` (Geist, Geist Mono y Playfair Display para la mascota) | Se sirven desde el propio sitio: no dependen de Google Fonts ni bloquean el render |

## Estructura

```
src/
├── actions/index.ts          → sendContact (Zod + Resend + adjunto + anti-spam)
├── components/
│   ├── NavBar.astro          → navegación flotante, idioma, tema y menú móvil
│   ├── Footer.astro
│   ├── Logo.astro            → mosaico verde con el edificio + nombre
│   ├── Mascot.astro          → la "mancha" TramiMuni
│   ├── ArrowButton.astro     → botón píldora con flecha en círculo
│   ├── FormDownload.astro    → tarjeta de descarga de un formulario PDF
│   ├── MobileFormTip.astro   → nota para llenar los PDF en el celular (solo pantallas táctiles)
│   ├── PageHero.astro
│   ├── ArrowIcon.astro
│   └── BuildingIcon.astro
├── content/services/{es,en}/<clave>.md → un archivo por servicio e idioma
├── content.config.ts         → esquema Zod de la colección
├── data/
│   ├── site.ts               → nombre, correo, ubicación
│   ├── services.ts           → servicios por idioma con su URL
│   └── forms.ts              → formularios oficiales descargables
├── i18n/ui.ts                → textos de interfaz es/en y rutas por idioma
├── lib/
│   ├── email.ts              → verificación DNS (MX) del correo
│   └── attachment.ts         → límites del adjunto (cliente y servidor)
├── layouts/BaseLayout.astro  → <head>, hreflang, tema sin parpadeo, animaciones
├── views/                    → Home, Service y Contact (las páginas de cada idioma solo pasan `lang`)
├── pages/
│   ├── index.astro, contacto.astro, servicios/[slug].astro
│   ├── en/index.astro, en/contact.astro, en/services/[slug].astro
│   └── 404.astro
└── styles/global.css
public/
├── formularios/              → PDF oficiales con campos rellenables
└── favicon.svg, og.jpg
```

## Cómo agregar un servicio

1. Crear `src/content/services/es/<clave>.md` y `src/content/services/en/<clave>.md` con el mismo nombre de archivo (la clave une ambas traducciones).
2. Definir `url_slug` (segmento de la URL en ese idioma), `group` (`inmuebles`, `agro`, `permisos` u `orientacion`) y, si aplica, `law` y `form`.

Sin tocar código, el servicio aparece en el navbar, el menú móvil, el footer, el inicio, el selector del formulario y su página en ambos idiomas. Si falta un campo requerido, el build falla con un error de Zod que indica cuál.

## Formularios PDF

Los formularios oficiales de la municipalidad (`F-SBI-001-2024` y `F-SBI-002-2024`) se publican en `public/formularios/` con campos rellenables (AcroForm) colocados sobre el diseño original. La firma se deja en blanco: va a mano o con firma digital. Los campos son widgets simples con fuentes en `/DR` y `NeedAppearances`, para que también se puedan llenar en la app Archivos (iPhone), Google Drive o Acrobat; los visores integrados del navegador en el celular no permiten escribir, por eso la nota de `MobileFormTip`. Si la municipalidad publica una versión nueva, hay que volver a generar los campos y actualizar `src/data/forms.ts`.

## Formulario de contacto

1. **Cliente** (`views/ContactView.astro`): valida igual que el servidor, muestra los errores por campo (`aria-invalid` y `aria-describedby`), indica que se está enviando y persiste el nombre en `localStorage`. `?service=<clave>` preselecciona el tipo de trámite y luego se limpia de la URL.
2. **Servidor** (`actions/index.ts`): el esquema Zod es la fuente de verdad. Los errores de entrada vuelven como códigos (`email_unreachable`, `attachment_size`…) que el cliente traduce con `src/i18n/ui.ts`. El adjunto opcional (PDF, JPG o PNG, máximo 4 MB por el límite de 4,5 MB de Vercel) llega como archivo adjunto en el correo.
3. **Anti-spam** sin dependencias: un campo trampa oculto y un tiempo mínimo de 3 s entre la carga y el envío. A un bot detectado se le responde "ok" y no se envía nada.
4. **Verificación del correo** (`lib/email.ts`): consulta DNS del dominio. Rechaza dominios inexistentes, sin servidor de correo o con *null MX* (RFC 7505). Si el DNS falla o tarda más de 4 s, acepta el envío para no bloquear a un usuario real. No confirma que el buzón exista; para eso hace falta un correo de confirmación, que requiere un dominio verificado en Resend.
5. **Después de enviar**: el formulario se vacía por completo. El nombre sigue en `localStorage` y se restaura en la próxima visita.
6. **Correo**: texto plano y HTML con escape de caracteres. `replyTo` es el correo del usuario, así que basta con "Responder" en la bandeja.

### Variables de entorno

Copiar `.env.example` a `.env`. En Vercel se configuran en *Project Settings → Environment Variables*.

| Variable | Descripción |
|---|---|
| `RESEND_API_KEY` | Clave de API de Resend |
| `CONTACT_TO` | Bandeja que recibe los mensajes |
| `CONTACT_FROM` | Remitente. `onboarding@resend.dev` solo entrega al dueño de la cuenta; en producción, verificar un dominio |

Las variables se declaran con `astro:env`: son tipadas, solo existen en el servidor y el build falla si falta alguna.

## Scripts

```bash
yarn install
yarn dev       # http://localhost:4321
yarn check     # verificación de tipos (.astro + .ts)
yarn build     # salida para Vercel en .vercel/output
```

## Convenciones de código

- **Idioma:** el código (variables, funciones, props, claves de contenido, clases e IDs) está en inglés. El texto visible y las rutas públicas (`/servicios`, `/contacto`) están en español.
- **CSS:** clases, IDs y variables en `snake_case` con un solo guion bajo (`service_row_title`, `--color_accent`).
- **TypeScript:** convenciones del lenguaje: `camelCase` para variables y funciones, `PascalCase` para tipos y componentes, `UPPER_SNAKE_CASE` para constantes.
- **Atributos `data-*` y `aria-*`:** en `kebab-case`, como define el estándar HTML (`data-theme-toggle` se lee en JS como `dataset.themeToggle`).

## Decisiones de diseño y accesibilidad

- **Mobile-first**, con puntos de quiebre en 640, 768, 1024 y 1200 px (navegación completa desde 1200 px).
- **Modo oscuro**: un script en línea en el `<head>` aplica el tema antes de pintar. Si no hay preferencia guardada, respeta `prefers-color-scheme`. En estilos con alcance se usa `:global([data-theme="dark"])` porque `<html>` está fuera del ámbito del componente.
- **Idiomas**: el botón ES/EN enlaza a la misma página en el otro idioma; cada página declara `hreflang` para buscadores.
- **Animaciones**: elementos con `data-reveal` aparecen al entrar en pantalla (opacidad, desplazamiento y desenfoque, escalonados con `--i`). Solo se ocultan si hay JavaScript (`html.js`), y con *reducir movimiento* se muestran sin animación.
- **Accesibilidad**: enlace "Saltar al contenido", `aria-current` en la navegación, menú móvil que se cierra con Escape, foco visible, `prefers-reduced-motion` y jerarquía de encabezados sin saltos.
- **SEO**: `canonical`, Open Graph y título por página.
