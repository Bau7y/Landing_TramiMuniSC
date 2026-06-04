/* ============================================================
   components.js — TramiMuniSC
   Web Components nativos: <nav-bar> y <site-footer>
   Estándar W3C — sin librerías externas
   ============================================================ */

/* ── 1. Navbar Component ────────────────────────────────── */
class NavBar extends HTMLElement {

  connectedCallback() {
    this.innerHTML = `
      <nav class="navbar" role="navigation" aria-label="Navegación principal">
        <div class="container navbar__inner">

          <!-- Logo -->
          <a href="/index.html" class="navbar__logo" aria-label="TramiMuniSC - Inicio">
            Trami<span>Muni</span>SC
          </a>

          <!-- Links desktop — Flexbox -->
          <ul class="navbar__links" role="list">
            <li><a href="/index.html">Inicio</a></li>
            <li><a href="/pages/exoneraciones.html">Exoneraciones</a></li>
            <li><a href="/pages/declaraciones.html">Declaraciones</a></li>
            <li><a href="/pages/consultas.html">Consultas</a></li>
            <li><a href="/pages/otros.html">Otros</a></li>
          </ul>

          <!-- Acciones -->
          <div class="navbar__actions">

            <!-- Toggle dark mode -->
            <button
              class="btn-theme"
              id="theme-toggle"
              aria-label="Cambiar modo de color"
              aria-pressed="false"
            >
              <span id="theme-icon">🌙</span>
            </button>

            <!-- CTA contacto (visible en tablet+) -->
            <a
              href="/pages/contacto.html"
              class="btn-nav-cta"
              aria-label="Ir a página de contacto"
            >
              Contáctenos
            </a>

            <!-- Botón hamburger (visible en móvil) -->
            <button
              class="btn-menu"
              id="menu-toggle"
              aria-label="Abrir menú de navegación"
              aria-expanded="false"
              aria-controls="mobile-menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

          </div>
        </div>

        <!-- Menú móvil -->
        <div
          class="navbar__mobile"
          id="mobile-menu"
          role="menu"
          aria-label="Menú móvil"
        >
          <a href="/index.html" role="menuitem">Inicio</a>
          <a href="/pages/exoneraciones.html" role="menuitem">Exoneraciones</a>
          <a href="/pages/declaraciones.html" role="menuitem">Declaraciones</a>
          <a href="/pages/consultas.html" role="menuitem">Consultas</a>
          <a href="/pages/otros.html" role="menuitem">Otros</a>
          <a href="/pages/contacto.html" role="menuitem">Contáctenos</a>
        </div>
      </nav>
    `

    this._initScrollEffect()
    this._initMobileMenu()
    this._initActiveLink()
  }

  /* Sombra al hacer scroll */
  _initScrollEffect() {
    const navbar = this.querySelector('.navbar')

    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        navbar.classList.add('scrolled')
      } else {
        navbar.classList.remove('scrolled')
      }
    }, { passive: true })
  }

  /* Hamburger menu toggle */
  _initMobileMenu() {
    const menuBtn    = this.querySelector('#menu-toggle')
    const mobileMenu = this.querySelector('#mobile-menu')

    menuBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open')
      menuBtn.classList.toggle('open', isOpen)
      menuBtn.setAttribute('aria-expanded', isOpen)
    })

    /* Cerrar menú al hacer click en un link */
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open')
        menuBtn.classList.remove('open')
        menuBtn.setAttribute('aria-expanded', 'false')
      })
    })

    /* Cerrar menú al hacer click fuera */
    document.addEventListener('click', (e) => {
      if (!this.contains(e.target)) {
        mobileMenu.classList.remove('open')
        menuBtn.classList.remove('open')
        menuBtn.setAttribute('aria-expanded', 'false')
      }
    })
  }

  /* Marcar el link activo según la URL actual */
  _initActiveLink() {
    const currentPath = window.location.pathname

    this.querySelectorAll('a').forEach(link => {
      const linkPath = new URL(link.href).pathname

      if (
        linkPath === currentPath ||
        (currentPath === '/' && linkPath.endsWith('index.html'))
      ) {
        link.classList.add('active')
        link.setAttribute('aria-current', 'page')
      }
    })
  }
}

/* ── 2. Footer Component ────────────────────────────────── */
class SiteFooter extends HTMLElement {

  connectedCallback() {
    const year = new Date().getFullYear()

    this.innerHTML = `
      <footer class="footer" role="contentinfo">
        <div class="container">

          <!-- Grid del footer -->
          <div class="footer__grid">

            <!-- Columna brand -->
            <div class="footer__brand">
              <a href="/index.html" class="navbar__logo" aria-label="TramiMuniSC - Inicio">
                Trami<span>Muni</span>SC
              </a>
              <p>
                Servicio de acompañamiento para trámites
                municipales en San Carlos, Costa Rica.
              </p>
            </div>

            <!-- Columna servicios -->
            <div class="footer__col">
              <h4>Servicios</h4>
              <ul role="list">
                <li><a href="/pages/exoneraciones.html">Exoneraciones</a></li>
                <li><a href="/pages/declaraciones.html">Declaraciones</a></li>
                <li><a href="/pages/consultas.html">Consultas</a></li>
                <li><a href="/pages/otros.html">Otros trámites</a></li>
              </ul>
            </div>

            <!-- Columna contacto -->
            <div class="footer__col">
              <h4>Contacto</h4>
              <ul role="list">
                <li>
                  <a
                    href="/pages/contacto.html"
                    aria-label="Ir a formulario de contacto"
                  >
                    Formulario de contacto
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:tramimuni@gmail.com"
                    aria-label="Enviar correo a TramiMuni"
                  >
                    tramimuni@gmail.com
                  </a>
                </li>
              </ul>
            </div>

          </div>

          <!-- Barra inferior -->
          <div class="footer__bottom">
            <p>© ${year} TramiMuniSC. Todos los derechos reservados.</p>
            <p>San Carlos, Alajuela, Costa Rica</p>
          </div>

        </div>
      </footer>
    `
  }
}

/* ── 3. Registro de componentes ─────────────────────────── */
customElements.define('nav-bar', NavBar)
customElements.define('site-footer', SiteFooter)