// @ts-check
import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import { createHash } from 'node:crypto';
import { THEME_INIT } from './src/lib/theme_init.mjs';

/** CSP hash for the one inline script Astro does not process (theme before first paint). */
/** @type {`sha256-${string}`} */
const themeInitHash = `sha256-${createHash('sha256').update(THEME_INIT).digest('base64')}`;

export default defineConfig({
  site: 'https://www.tramimunisc.com',
  adapter: vercel(),
  // hreflang pairs live in each page <head> (slugs differ by language)
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404') && !page.endsWith('/404/') })],
  trailingSlash: 'never',
  // All CSS goes inside each HTML page: no render-blocking request and no
  // unstyled page if a separate stylesheet fails to load.
  build: { inlineStylesheets: 'always' },
  // No code blocks on the site; Shiki's inline styles would clash with the CSP
  markdown: { syntaxHighlight: false },
  // Content Security Policy as a <meta> per page: Astro hashes every script
  // and style it emits, so nothing injected from outside can run.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self' https://challenges.cloudflare.com",
        "frame-src https://challenges.cloudflare.com",
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
      ],
      scriptDirective: {
        resources: ["'self'", 'https://challenges.cloudflare.com'],
        hashes: [themeInitHash],
      },
    },
  },
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: { prefixDefaultLocale: false },
  },
  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret' }),
      CONTACT_TO:     envField.string({ context: 'server', access: 'secret' }),
      CONTACT_FROM:   envField.string({
        context: 'server',
        access: 'secret',
        default: 'TramiMuniSC <contacto@tramimunisc.com>',
      }),
      // Optional anti-spam services: each layer turns on when its keys exist
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
      TURNSTILE_SECRET_KEY:      envField.string({ context: 'server', access: 'secret', optional: true }),
      UPSTASH_REDIS_REST_URL:    envField.string({ context: 'server', access: 'secret', optional: true }),
      UPSTASH_REDIS_REST_TOKEN:  envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
