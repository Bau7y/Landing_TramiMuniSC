// @ts-check
import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://tramimunisc.vercel.app',
  adapter: vercel(),
  trailingSlash: 'never',
  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret' }),
      CONTACT_TO:     envField.string({ context: 'server', access: 'secret' }),
      CONTACT_FROM:   envField.string({
        context: 'server',
        access: 'secret',
        default: 'TramiMuniSC <onboarding@resend.dev>',
      }),
    },
  },
});
