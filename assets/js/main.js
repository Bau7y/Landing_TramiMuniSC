/* ============================================================
   main.js — TramiMuniSC
   Lógica global: dark mode + localStorage
   JS nativo — sin librerías externas
   ============================================================ */

/* ── 1. Constantes ──────────────────────────────────────── */
const THEME_KEY     = 'tramimuni-theme'
const DARK_VALUE    = 'dark'
const LIGHT_VALUE   = 'light'
const ICON_DARK     = '🌙'
const ICON_LIGHT    = '☀️'

/* ── 2. Aplicar tema ────────────────────────────────────── */

/* Se aplica el tema antes de que el DOM cargue por completo para evitar parpadeos */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

/*
  Lee el tema guardado en localStorage.
  Si no existe aún (primera visita), usa la preferencia
  del sistema operativo mediante prefers-color-scheme.
*/
function getSavedTheme() {
  const saved = localStorage.getItem(THEME_KEY)

  if (saved) return saved

  /* Preferencia del sistema como fallback */
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? DARK_VALUE : LIGHT_VALUE
}

/* Aplicar tema inmediatamente al cargar el script */
const currentTheme = getSavedTheme()
applyTheme(currentTheme)

/* ── 3. Inicialización del toggle ───────────────────────── */

/*
  Espera a que el DOM esté listo para buscar el botón.
  El botón vive dentro del Web Component <nav-bar>,
  que se renderiza cuando connectedCallback() se ejecuta.
*/
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle()
})

function initThemeToggle() {
  /*
    El botón está dentro del Shadow DOM del Web Component.
    Como usamos innerHTML (no Shadow DOM cerrado),
    podemos acceder a él con querySelector normal.
  */
  const toggle = document.querySelector('#theme-toggle')
  const icon   = document.querySelector('#theme-icon')

  if (!toggle || !icon) return

  /* Sincronizar ícono con el tema actual al cargar */
  syncIcon(icon, document.documentElement.getAttribute('data-theme'))

  /* Sincronizar aria-pressed con el tema actual */
  const isDark = document.documentElement.getAttribute('data-theme') === DARK_VALUE
  toggle.setAttribute('aria-pressed', isDark)

  /* Escuchar clicks en el botón */
  toggle.addEventListener('click', () => {
    const activeDark  = document.documentElement.getAttribute('data-theme') === DARK_VALUE
    const targetTheme = activeDark ? LIGHT_VALUE : DARK_VALUE

    /* Aplicar el nuevo tema */
    applyTheme(targetTheme)

    /* Persistir en localStorage */
    localStorage.setItem(THEME_KEY, targetTheme)

    /* Actualizar ícono y aria-pressed */
    syncIcon(icon, targetTheme)
    toggle.setAttribute('aria-pressed', targetTheme === DARK_VALUE)
  })
}

/* Actualiza el ícono según el tema activo */
function syncIcon(iconEl, theme) {
  iconEl.textContent = theme === DARK_VALUE ? ICON_LIGHT : ICON_DARK
}

/* ── 4. Detectar cambio de preferencia del sistema ──────── */

/*
  Si el usuario cambia el modo del sistema operativo
  mientras tiene la página abierta, se actualiza automáticamente
  solo si no tiene una preferencia guardada manualmente.
*/
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  const manualPref = localStorage.getItem(THEME_KEY)

  if (!manualPref) {
    const systemTheme = e.matches ? DARK_VALUE : LIGHT_VALUE
    applyTheme(systemTheme)

    const icon = document.querySelector('#theme-icon')
    if (icon) syncIcon(icon, systemTheme)
  }
})