/**
 * Runs before first paint: applies the saved/system theme and adds the `js`
 * class that enables scroll reveals. Kept as a string so astro.config.mjs can
 * hash exactly the same bytes for the Content Security Policy.
 */
export const THEME_INIT = `(() => {
  const root = document.documentElement;
  root.classList.add('js');
  let theme = null;
  try { theme = localStorage.getItem('tramimuni_theme'); } catch {}
  if (!theme) theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.dataset.theme = theme;
})();`;
