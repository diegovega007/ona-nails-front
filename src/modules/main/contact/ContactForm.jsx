import { useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from './contactData'
import FormField from './FormField'
import MailIcon from '../../../assets/icons/mailIcon'
import SpinnerIcon from '../../../assets/icons/spinnerIcon'
import CheckCircleIcon from '../../../assets/icons/checkCircleIcon'
import AlertCircleIcon from '../../../assets/icons/alertCircleIcon'

const INITIAL_FORM = { name: '', email: '', phone: '', message: '' }

const textareaClass =
  'w-full px-4 py-3 rounded-xl border border-neutral-gray/60 bg-background font-sans text-sm text-text-dark placeholder:text-text-light/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none'

const ContactForm = () => {
  const formRef               = useRef(null)
  const [form, setForm]       = useState(INITIAL_FORM)
  const [sending, setSending] = useState(false)
  const [status, setStatus]   = useState(null) // 'success' | 'error' | null

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setStatus(null)
    try {
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formRef.current,
        EMAILJS_PUBLIC_KEY,
      )
      setStatus('success')
      setForm(INITIAL_FORM)
    } catch {
      setStatus('error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-soft border border-neutral-gray/40 p-8">
      <h2 className="font-serif text-2xl font-bold text-text-dark mb-2">
        Envíanos un mensaje
      </h2>
      <p className="font-sans text-sm text-text-light mb-7 leading-relaxed">
        Cuéntanos en qué podemos ayudarte y te responderemos a la brevedad.
      </p>

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField
          label="Nombre completo"
          id="name"
          name="name"
          type="text"
          placeholder="Tu nombre"
          value={form.name}
          onChange={handleChange}
          required
        />
        <FormField
          label="Correo electrónico"
          id="email"
          name="email"
          type="email"
          placeholder="tu@correo.com"
          value={form.email}
          onChange={handleChange}
          required
        />
        <FormField
          label="Teléfono (opcional)"
          id="phone"
          name="phone"
          type="tel"
          placeholder="+52 55 0000 0000"
          value={form.phone}
          onChange={handleChange}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="message" className="font-sans text-sm font-medium text-text-dark">
            Mensaje
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            placeholder="¿En qué podemos ayudarte?"
            value={form.message}
            onChange={handleChange}
            required
            className={textareaClass}
          />
        </div>

        <FormFeedback status={status} />

        <button
          type="submit"
          disabled={sending}
          className="flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-primary-dark hover:bg-primary-dark/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-2xl shadow-medium transition-all duration-300 hover:scale-[1.02]"
        >
          {sending ? (
            <>
              <SpinnerIcon className="w-5 h-5 animate-spin" />
              Enviando…
            </>
          ) : (
            <>
              <MailIcon className="w-5 h-5" />
              Enviar mensaje
            </>
          )}
        </button>
      </form>
    </div>
  )
}

const FormFeedback = ({ status }) => {
  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
        <CheckCircleIcon className="w-5 h-5 text-green-600 shrink-0" />
        <p className="font-sans text-sm text-green-700">
          ¡Mensaje enviado! Te responderemos pronto.
        </p>
      </div>
    )
  }
  if (status === 'error') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
        <AlertCircleIcon className="w-5 h-5 text-red-500 shrink-0" />
        <p className="font-sans text-sm text-red-600">
          Hubo un error al enviar. Intenta de nuevo o escríbenos por WhatsApp.
        </p>
      </div>
    )
  }
  return null
}

export default ContactForm
