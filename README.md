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
│   ├── Faq.astro             → acordeón <details> + su FAQPage JSON-LD
│   ├── JsonLd.astro          → imprime datos estructurados
│   ├── LangSuggest.astro     → ofrece el otro idioma (nunca redirige)
│   ├── Fonts.astro           → fuentes propias (subconjunto latin) con preload
│   ├── PageHero.astro
│   ├── ArrowIcon.astro
│   └── BuildingIcon.astro
├── content/services/{es,en}/<clave>.md → un archivo por servicio e idioma
├── content.config.ts         → esquema Zod de la colección
├── data/
│   ├── site.ts               → nombre, correo, ubicación
│   ├── services.ts           → servicios por idioma con su URL
│   ├── forms.ts              → formularios oficiales descargables
│   └── home_faq.ts           → preguntas frecuentes generales del inicio
├── i18n/ui.ts                → textos de interfaz es/en y rutas por idioma
├── lib/
│   ├── email.ts              → verificación DNS (MX) del correo
│   ├── attachment.ts         → límites del adjunto (cliente y servidor)
│   ├── structured_data.ts    → constructores de JSON-LD (negocio, servicio, migas, FAQ)
│   ├── theme_init.mjs        → script de tema antes de pintar (también se hashea para la CSP)
│   └── spam/                 → filtros del contacto, independientes entre sí
│       ├── content.ts        → veredicto: ok / revisar / ofensivo / spam
│       ├── lists.ts          → listas de palabras editables
│       ├── text.ts           → normalización (acentos, leetspeak, letras repetidas)
│       ├── rate_limit.ts     → límite por IP (Upstash o memoria)
│       └── turnstile.ts      → verificación de Cloudflare Turnstile
├── layouts/BaseLayout.astro  → <head>, hreflang, tema sin parpadeo, animaciones
├── views/                    → Home, Service y Contact (las páginas de cada idioma solo pasan `lang`)
├── pages/
│   ├── index.astro, contacto.astro, servicios/[slug].astro
│   ├── en/index.astro, en/contact.astro, en/services/[slug].astro
│   ├── robots.txt.ts         → robots.txt generado con el dominio de `site`
│   └── 404.astro
└── styles/global.css
public/
├── formularios/              → PDF oficiales con campos rellenables
└── favicon.svg, og.jpg
scripts/a11y.mjs              → pruebas axe (WCAG 2.2 AA) en todas las páginas, claro y oscuro
vercel.json                   → encabezados de seguridad y caché
.github/workflows/a11y.yml    → corre las pruebas de accesibilidad en cada push
```

## Cómo agregar un servicio

1. Crear `src/content/services/es/<clave>.md` y `src/content/services/en/<clave>.md` con el mismo nombre de archivo (la clave une ambas traducciones).
2. Definir `url_slug` (segmento de la URL en ese idioma), `group` (`inmuebles`, `agro`, `permisos` u `orientacion`), `seo_title` (con el lugar, para Google) y, si aplica, `law`, `form` y `faq` (lista de `q`/`a`).

Sin tocar código, el servicio aparece en el navbar, el menú móvil, el footer, el inicio, el selector del formulario y su página en ambos idiomas. Si falta un campo requerido, el build falla con un error de Zod que indica cuál.

## Formularios PDF

Los formularios oficiales de la municipalidad (`F-SBI-001-2024` y `F-SBI-002-2024`) se publican en `public/formularios/` con campos rellenables (AcroForm) colocados sobre el diseño original. La firma se deja en blanco: va a mano o con firma digital. Los campos son widgets simples con fuentes en `/DR` y `NeedAppearances`, para que también se puedan llenar en la app Archivos (iPhone), Google Drive o Acrobat; los visores integrados del navegador en el celular no permiten escribir, por eso la nota de `MobileFormTip`. Si la municipalidad publica una versión nueva, hay que volver a generar los campos y actualizar `src/data/forms.ts`.

## Formulario de contacto

1. **Cliente** (`views/ContactView.astro`): valida igual que el servidor, muestra los errores por campo (`aria-invalid` y `aria-describedby`), indica que se está enviando y persiste el nombre en `localStorage`. `?service=<clave>` preselecciona el tipo de trámite y luego se limpia de la URL.
2. **Servidor** (`actions/index.ts`): el esquema Zod es la fuente de verdad. Los errores de entrada vuelven como códigos (`email_unreachable`, `attachment_size`…) que el cliente traduce con `src/i18n/ui.ts`. El adjunto opcional (PDF, JPG o PNG, máximo 4 MB por el límite de 4,5 MB de Vercel) llega como archivo adjunto en el correo.
3. **Anti-spam por capas** (`lib/spam/`), cada una independiente:
   - Campo trampa oculto y tiempo mínimo de 3 s: a un bot se le responde "ok" y no se envía nada.
   - Límite de 5 mensajes por hora y por IP. Con `UPSTASH_REDIS_REST_*` el conteo es compartido; sin ellas, en memoria por instancia.
   - Cloudflare Turnstile (captcha invisible) si existen sus claves.
   - Contenido: lenguaje ofensivo → se pide reescribir el mensaje; spam claro (varios enlaces, acortadores, correos desechables, alfabetos no esperados, 2+ términos de spam) → se descarta y queda en los logs de Vercel; señales leves o un mensaje que no menciona temas del servicio → llega con `[Revisar]` en el asunto y el motivo en el cuerpo. Nada legítimo se descarta solo por no usar palabras clave.
   - Las listas están en `lib/spam/lists.ts`; la comparación ignora mayúsculas, acentos, leetspeak (`p3nd3j0`) y letras repetidas.
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
| `PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Opcionales. Activan Cloudflare Turnstile |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Opcionales. Límite de envíos compartido entre instancias |

Las variables se declaran con `astro:env`: son tipadas, las secretas solo existen en el servidor y el build falla si falta alguna obligatoria. Las opcionales encienden su capa solo cuando existen.

Para separar los mensajes dudosos en Gmail: filtro con *Asunto contiene `[Revisar]`* → aplicar una etiqueta.

## Scripts

```bash
yarn install
yarn dev       # http://localhost:4321
yarn check     # verificación de tipos (.astro + .ts)
yarn build     # salida para Vercel en .vercel/output
yarn test:a11y # axe sobre el build (requiere `npx playwright install chromium-headless-shell`)
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
- **Accesibilidad**: enlace "Saltar al contenido", `aria-current` en la navegación, foco visible, `prefers-reduced-motion`, jerarquía de encabezados sin saltos y contraste AA en todos los colores de texto. El menú móvil se cierra con Escape y deja el resto de la página `inert` mientras está abierto. El formulario anuncia cuántos campos tienen error. `yarn test:a11y` lo verifica en cada push.
- **SEO**: `canonical`, `hreflang`, Open Graph, `seo_title` por servicio, `sitemap-index.xml`, `robots.txt` y JSON-LD (`ProfessionalService`, `Service`, `BreadcrumbList`, `FAQPage`). Google ya no muestra el desplegable de FAQ (desde mayo de 2026), pero sigue leyendo el marcado; las respuestas visibles son lo que aporta.
- **Idioma sugerido**: si el navegador prefiere el otro idioma se ofrece un aviso descartable; nunca se redirige, para no confundir a buscadores ni a quien eligió un idioma.

## Rendimiento y seguridad

- **CSS en línea** (`build.inlineStylesheets: 'always'`): cada página trae su CSS dentro del HTML. No hay hojas de estilo externas que bloqueen el pintado ni que, si fallan, dejen la página sin estilos.
- **Fuentes propias**, solo el subconjunto latin (español e inglés), con `preload` y `font-display: swap`.
- **Sin reflows forzados**: el navbar detecta el scroll con `IntersectionObserver` sobre un centinela, sin leer `scrollY` ni medidas del DOM.
- **CSP** (`security.csp` de Astro): cada página lleva una política con hashes de sus scripts y estilos; nada inyectado puede ejecutarse. Por eso no se usan atributos `style` en línea: el escalonado de animaciones usa `data-i`.
- **Encabezados** (`vercel.json`): HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, sin iframes de terceros (`frame-ancestors 'none'`) y caché de un año para `/_astro/` (archivos con hash).
- **Páginas estáticas**: solo el formulario corre en el servidor. SSR no aportaría nada en una landing y agregaría latencia y costo.
