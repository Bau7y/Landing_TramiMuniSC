# TramiMuniSC

Landing page para un servicio de acompañamiento en trámites ante la Municipalidad de San Carlos, Costa Rica. Nació como Laboratorio #1 de ISW-521 (Programación en Ambiente Web I, UTN) en HTML, CSS y JS nativos. La versión 2 migra a **Astro** para reutilizar componentes, escalar contenido y enviar el formulario de contacto desde el servidor.

## Stack

| Capa | Tecnología | Rol |
|---|---|---|
| Framework | Astro 7 | Genera HTML estático; solo la acción de contacto corre en el servidor |
| Estilos | CSS nativo con variables (`snake_case`) | `global.css` con tokens y estilos con alcance por componente |
| Interactividad | TypeScript nativo en `<script>` | Tema, menú móvil y formulario. Sin librerías de UI |
| Contenido | Content Collections (Markdown + Zod) | Un archivo `.md` por servicio |
| Backend | Astro Actions + Zod | Validación tipada del formulario en el servidor |
| Correo | Resend | Envío transaccional (gratis hasta 3 000 correos al mes y 100 al día) |
| Deploy | Vercel (`@astrojs/vercel`) | Páginas estáticas en CDN y la acción como función serverless |
| Fuentes | `@fontsource-variable` (DM Sans y Playfair Display) | Se sirven desde el propio sitio: no dependen de Google Fonts ni bloquean el render |

## Estructura

```
src/
├── actions/index.ts          → enviarContacto (Zod + Resend + anti-spam)
├── assets/servicios/         → imágenes fuente (Astro las optimiza a WebP)
├── components/
│   ├── NavBar.astro          → navegación, tema y menú móvil
│   ├── Footer.astro
│   ├── Logo.astro
│   ├── PageHero.astro        → encabezado y ruta de navegación de subpáginas
│   ├── SectionHeader.astro   → badge + h2 + bajada
│   ├── ServiceCard.astro
│   └── IconoEdificio.astro
├── content/servicios/*.md    → contenido de cada servicio
├── content.config.ts         → esquema Zod de la colección
├── data/
│   ├── sitio.ts              → nombre, correo, horario (única fuente)
│   └── navegacion.ts         → enlaces derivados de la colección
├── layouts/BaseLayout.astro  → <head>, SEO, tema sin parpadeo, skip link
├── pages/
│   ├── index.astro
│   ├── contacto.astro
│   ├── servicios/[slug].astro → una plantilla para todos los servicios
│   └── 404.astro
└── styles/global.css
public/                       → favicon.svg, og.jpg
```

## Cómo agregar un servicio

1. Crear `src/content/servicios/<slug>.md` copiando uno existente.
2. Poner la imagen en `src/assets/servicios/` y referenciarla en `tarjeta.imagen`.

Sin tocar código, el servicio aparece en el navbar, el menú móvil, el footer, las tarjetas del inicio, el selector del formulario y su página `/servicios/<slug>`. Si falta un campo requerido, el build falla con un error de Zod que indica cuál.

## Formulario de contacto

1. **Cliente** (`contacto.astro`): valida igual que el servidor, muestra los errores por campo (`aria-invalid` y `aria-describedby`), indica que se está enviando y persiste el nombre en `localStorage`. `?tramite=<slug>` preselecciona el tipo de trámite.
2. **Servidor** (`actions/index.ts`): el esquema Zod es la fuente de verdad. Los errores de entrada vuelven al cliente como `error.fields`.
3. **Anti-spam** sin dependencias: un campo trampa oculto y un tiempo mínimo de 3 s entre la carga y el envío. A un bot detectado se le responde "ok" y no se envía nada.
4. **Correo**: texto plano y HTML con escape de caracteres. `replyTo` es el correo del usuario, así que basta con "Responder" en la bandeja.

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

## Decisiones de diseño y accesibilidad

- **Mobile-first**, con puntos de quiebre en 640, 768, 900 y 1024 px.
- **Modo oscuro**: un script en línea en el `<head>` aplica el tema antes de pintar. Si no hay preferencia guardada, respeta `prefers-color-scheme`. En estilos con alcance se usa `:global([data-theme="dark"])` porque `<html>` está fuera del ámbito del componente.
- **Imágenes**: `<Image>` genera WebP en 320, 480 y 640 px con `srcset`. Cada tarjeta pasa de alrededor de 2 MB a entre 7 y 40 KB.
- **Accesibilidad**: enlace "Saltar al contenido", `aria-current` en la navegación, menú móvil que se cierra con Escape, foco visible, `prefers-reduced-motion` y jerarquía de encabezados sin saltos.
- **SEO**: `canonical`, Open Graph y título por página.
