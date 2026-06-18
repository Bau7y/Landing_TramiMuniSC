/* Constantes */
const THEME_KEY     = 'tramimuni-theme'
const DARK_VALUE    = 'dark'
const LIGHT_VALUE   = 'light'
const ICON_DARK     = '🌙'
const ICON_LIGHT    = '☀️'

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
}


function getSavedTheme() {
  const saved = localStorage.getItem(THEME_KEY)

  if (saved) return saved

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? DARK_VALUE : LIGHT_VALUE
}

const currentTheme = getSavedTheme()
applyTheme(currentTheme)

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle()
})

function initThemeToggle() {

  const toggle = document.querySelector('#theme-toggle')
  const icon   = document.querySelector('#theme-icon')

  if (!toggle || !icon) return

  /* Sincroniza ícono */
  syncIcon(icon, document.documentElement.getAttribute('data-theme'))

  /* Sincronizar aria-pressed con el tema actual */
  const isDark = document.documentElement.getAttribute('data-theme') === DARK_VALUE
  toggle.setAttribute('aria-pressed', isDark)

  toggle.addEventListener('click', () => {
    const activeDark  = document.documentElement.getAttribute('data-theme') === DARK_VALUE
    const targetTheme = activeDark ? LIGHT_VALUE : DARK_VALUE

    /* Aplicar el nuevo tema */
    applyTheme(targetTheme)

    localStorage.setItem(THEME_KEY, targetTheme)

    syncIcon(icon, targetTheme)
    toggle.setAttribute('aria-pressed', targetTheme === DARK_VALUE)
  })
}

function syncIcon(iconEl, theme) {
  iconEl.textContent = theme === DARK_VALUE ? ICON_LIGHT : ICON_DARK
}


window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  const manualPref = localStorage.getItem(THEME_KEY)

  if (!manualPref) {
    const systemTheme = e.matches ? DARK_VALUE : LIGHT_VALUE
    applyTheme(systemTheme)

    const icon = document.querySelector('#theme-icon')
    if (icon) syncIcon(icon, systemTheme)
  }
})