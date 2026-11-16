// @ts-check
import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel';
import { createHash } from 'node:crypto';
import { THEME_INIT } from './src/lib/theme_init.mjs';

/**
 * `astro dev` injects unhashed <style> tags (Vite) that the CSP header would
 * block, leaving the page unstyled. The CSP applies to builds only.
 */
const isDev = process.argv.includes('dev');

/** CSP hash for the one inline script Astro does not process (theme before first paint). */
/** @type {`sha256-${string}`} */
const themeInitHash = `sha256-${createHash('sha256').update(THEME_INIT).digest('base64')}`;

export default defineConfig({
  site: 'https://www.tramimunisc.com',
  // staticHeaders: the CSP below is sent as an HTTP header for every page
  // (instead of a <meta>), so frame-ancestors also applies.
  adapter: vercel({ staticHeaders: true }),
  // Sitemap, OG images and llms.txt are endpoints built from src/data/pages.ts
  trailingSlash: 'never',
  // All CSS goes inside each HTML page: no render-blocking request and no
  // unstyled page if a separate stylesheet fails to load.
  build: { inlineStylesheets: 'always' },
  // No code blocks on the site; Shiki's inline styles would clash with the CSP
  markdown: { syntaxHighlight: false },
  // Content Security Policy, sent as an HTTP header (staticHeaders above):
  // Astro hashes every script and style it emits, so nothing injected from
  // outside can run.
  security: isDev ? {} : {
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
        "frame-ancestors 'none'",
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
