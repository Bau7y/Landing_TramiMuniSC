/* Constantes */
const NOMBRE_KEY = 'tramimuni-contacto-nombre'

/* Inicialización */
document.addEventListener('DOMContentLoaded', () => {
  const form    = document.querySelector('#contact-form')
  const inputNombre  = document.querySelector('#nombre')
  const inputCorreo  = document.querySelector('#correo')
  const inputAsunto  = document.querySelector('#asunto')
  const inputMensaje = document.querySelector('#mensaje')
  const feedback     = document.querySelector('#form-feedback')

  if (!form) return

  /* nombre guardado en Localstorage */
  restoreNombre(inputNombre)

  inputNombre.addEventListener('input', () => {
    saveNombre(inputNombre.value.trim())
  })

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    clearErrors()
    const valid = validateForm(inputNombre, inputCorreo, inputAsunto, inputMensaje)

    if (!valid) return

    openMailto(
      inputNombre.value.trim(),
      inputCorreo.value.trim(),
      inputAsunto.value.trim(),
      inputMensaje.value.trim()
    )

    showFeedback(feedback, 'success')

    /* Limpiar formulario excepto el nombre (ya está guardado) */
    inputCorreo.value  = ''
    inputAsunto.value  = ''
    inputMensaje.value = ''
  })
})

function saveNombre(nombre) {
  if (nombre) {
    localStorage.setItem(NOMBRE_KEY, nombre)
  } else {
    localStorage.removeItem(NOMBRE_KEY)
  }
}

function restoreNombre(inputNombre) {
  const saved = localStorage.getItem(NOMBRE_KEY)
  if (saved) {
    inputNombre.value = saved
  }
}


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


function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/* Error en UI */
function showError(input, message) {
  input.classList.add('input-error')
  input.setAttribute('aria-invalid', 'true')

  const errorEl = document.createElement('span')
  errorEl.classList.add('field-error')
  errorEl.setAttribute('role', 'alert')
  errorEl.textContent = message

  input.parentElement.appendChild(errorEl)
}

function clearErrors() {
  document.querySelectorAll('.input-error').forEach(el => {
    el.classList.remove('input-error')
    el.removeAttribute('aria-invalid')
  })

  document.querySelectorAll('.field-error').forEach(el => el.remove())
}

function showFeedback(feedbackEl, type) {
  if (!feedbackEl) return

  feedbackEl.textContent = type === 'success'
    ? 'Mensaje enviado. Su cliente de correo debería abrirse en un momento.'
    : 'Ocurrió un error. Intente de nuevo.'

  feedbackEl.className = `form-feedback form-feedback--${type}`
  feedbackEl.removeAttribute('hidden')

  setTimeout(() => {
    feedbackEl.setAttribute('hidden', '')
  }, 6000)
}

function openMailto(nombre, correo, asunto, mensaje) {
  const destinatario = 'tramimuni@gmail.com'

  const cuerpo = encodeURIComponent(
    `Nombre: ${nombre}\nCorreo: ${correo}\n\n${mensaje}`
  )

  const asuntoCodificado = encodeURIComponent(asunto)

  const mailto = `mailto:${destinatario}?subject=${asuntoCodificado}&body=${cuerpo}`

  window.location.href = mailto
}