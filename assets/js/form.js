/* ============================================================
   form.js — TramiMuniSC
   Lógica del formulario de contacto
   - Persistencia del nombre con localStorage
   - Validación nativa antes del submit
   - Apertura de cliente de correo con mailto:
   JS nativo — sin librerías externas
   ============================================================ */

/* ── 1. Constantes ──────────────────────────────────────── */
const NOMBRE_KEY = 'tramimuni-contacto-nombre'

/* ── 2. Inicialización ──────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const form    = document.querySelector('#contact-form')
  const inputNombre  = document.querySelector('#nombre')
  const inputCorreo  = document.querySelector('#correo')
  const inputAsunto  = document.querySelector('#asunto')
  const inputMensaje = document.querySelector('#mensaje')
  const feedback     = document.querySelector('#form-feedback')

  if (!form) return

  /* Recuperar nombre guardado en localStorage */
  restoreNombre(inputNombre)

  /* Guardar nombre en localStorage cada vez que el usuario escribe */
  inputNombre.addEventListener('input', () => {
    saveNombre(inputNombre.value.trim())
  })

  /* Escuchar submit del formulario */
  form.addEventListener('submit', (e) => {
    e.preventDefault()

    /* Limpiar errores previos */
    clearErrors()

    /* Validar campos */
    const valid = validateForm(inputNombre, inputCorreo, inputAsunto, inputMensaje)

    if (!valid) return

    /* Construir y abrir mailto */
    openMailto(
      inputNombre.value.trim(),
      inputCorreo.value.trim(),
      inputAsunto.value.trim(),
      inputMensaje.value.trim()
    )

    /* Mostrar mensaje de éxito */
    showFeedback(feedback, 'success')

    /* Limpiar formulario excepto el nombre (ya está guardado) */
    inputCorreo.value  = ''
    inputAsunto.value  = ''
    inputMensaje.value = ''
  })
})

/* ── 3. localStorage — nombre ───────────────────────────── */

/*
  Guarda el nombre en localStorage para que persista
  cuando el usuario recargue la página o navegue y vuelva.
*/
function saveNombre(nombre) {
  if (nombre) {
    localStorage.setItem(NOMBRE_KEY, nombre)
  } else {
    localStorage.removeItem(NOMBRE_KEY)
  }
}

/*
  Recupera el nombre guardado y lo coloca en el input.
  Si no hay nada guardado, el campo queda vacío.
*/
function restoreNombre(inputNombre) {
  const saved = localStorage.getItem(NOMBRE_KEY)
  if (saved) {
    inputNombre.value = saved
  }
}

/* ── 4. Validación ──────────────────────────────────────── */

/*
  Valida que todos los campos requeridos estén completos
  y que el correo tenga un formato válido.
  Retorna true si todo está bien, false si hay errores.
*/
function validateForm(inputNombre, inputCorreo, inputAsunto, inputMensaje) {
  let valid = true

  if (!inputNombre.value.trim()) {
    showError(inputNombre, 'El nombre es requerido')
    valid = false
  }

  if (!inputCorreo.value.trim()) {
    showError(inputCorreo, 'El correo es requerido')
    valid = false
  } else if (!isValidEmail(inputCorreo.value.trim())) {
    showError(inputCorreo, 'Ingrese un correo válido')
    valid = false
  }

  if (!inputAsunto.value.trim()) {
    showError(inputAsunto, 'El asunto es requerido')
    valid = false
  }

  if (!inputMensaje.value.trim()) {
    showError(inputMensaje, 'El mensaje es requerido')
    valid = false
  } else if (inputMensaje.value.trim().length < 10) {
    showError(inputMensaje, 'El mensaje debe tener al menos 10 caracteres')
    valid = false
  }

  return valid
}

/*
  Valida el formato del correo con una expresión regular básica.
  Verifica que tenga la estructura: algo@algo.algo
*/
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/* ── 5. Manejo de errores en UI ─────────────────────────── */

/*
  Muestra un mensaje de error debajo del campo inválido
  y añade la clase de error para el estilo CSS.
*/
function showError(input, message) {
  input.classList.add('input-error')
  input.setAttribute('aria-invalid', 'true')

  const errorEl = document.createElement('span')
  errorEl.classList.add('field-error')
  errorEl.setAttribute('role', 'alert')
  errorEl.textContent = message

  input.parentElement.appendChild(errorEl)
}

/* Limpia todos los errores del formulario */
function clearErrors() {
  document.querySelectorAll('.input-error').forEach(el => {
    el.classList.remove('input-error')
    el.removeAttribute('aria-invalid')
  })

  document.querySelectorAll('.field-error').forEach(el => el.remove())
}

/* ── 6. Feedback de éxito ───────────────────────────────── */

/*
  Muestra un mensaje de confirmación al usuario
  después de enviar el formulario correctamente.
*/
function showFeedback(feedbackEl, type) {
  if (!feedbackEl) return

  feedbackEl.textContent = type === 'success'
    ? '✅ Mensaje enviado. Su cliente de correo debería abrirse en un momento.'
    : '❌ Ocurrió un error. Intente de nuevo.'

  feedbackEl.className = `form-feedback form-feedback--${type}`
  feedbackEl.removeAttribute('hidden')

  /* Ocultar el mensaje después de 6 segundos */
  setTimeout(() => {
    feedbackEl.setAttribute('hidden', '')
  }, 6000)
}

/* ── 7. Construcción del mailto ─────────────────────────── */

/*
  Construye la URL mailto con los datos del formulario
  y la abre en el cliente de correo del usuario.

  encodeURIComponent() convierte caracteres especiales
  (tildes, espacios, ñ) para que sean válidos en una URL.
*/
function openMailto(nombre, correo, asunto, mensaje) {
  const destinatario = 'tramimuni@gmail.com'

  const cuerpo = encodeURIComponent(
    `Nombre: ${nombre}\nCorreo: ${correo}\n\n${mensaje}`
  )

  const asuntoCodificado = encodeURIComponent(asunto)

  const mailto = `mailto:${destinatario}?subject=${asuntoCodificado}&body=${cuerpo}`

  window.location.href = mailto
}