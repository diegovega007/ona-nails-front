import { useEffect, useRef, useState } from 'react'
import { CONTACT_INFO, WHATSAPP_NUMBER } from '../contact/contactData'
import WhatsappIcon from '../../../assets/icons/whatsappIcon'
import InstagramIcon from '../../../assets/icons/instagramIcon'
import ContactIcon from '../../../assets/icons/contactIcon'

const whatsappMessage = encodeURIComponent(
  '¡Hola! Me gustaría obtener más información sobre sus servicios de Ona Nails.'
)
const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`

const instagramUrl = `https://instagram.com/${CONTACT_INFO.instagram.replace('@', '')}`

const Ballons = () => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    const onDocPointerDown = e => {
      if (!open) return
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocPointerDown)
    document.addEventListener('touchstart', onDocPointerDown, { passive: true })
    return () => {
      document.removeEventListener('mousedown', onDocPointerDown)
      document.removeEventListener('touchstart', onDocPointerDown)
    }
  }, [open])

  return (
    <div
      ref={rootRef}
      className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3"
    >
      <div
        className={`flex flex-col items-end gap-2 transition-all duration-200 origin-bottom ${
          open
            ? 'pointer-events-auto translate-y-0 opacity-100 scale-100'
            : 'pointer-events-none translate-y-2 opacity-0 scale-95'
        }`}
        aria-hidden={!open}
      >
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setOpen(false)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-2 ring-white/80 transition-transform hover:scale-105 hover:bg-[#1ebe5d]"
          aria-label="Abrir WhatsApp"
        >
          <WhatsappIcon className="h-6 w-6" />
        </a>
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setOpen(false)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-lg ring-2 ring-white/80 transition-transform hover:scale-105"
          aria-label="Abrir Instagram"
        >
          <InstagramIcon className="h-6 w-6 text-white" />
        </a>
      </div>

      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-label={open ? 'Cerrar accesos de contacto' : 'Abrir WhatsApp e Instagram'}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-dark text-white shadow-lg ring-2 ring-white/90 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2  focus-visible:ring-primary-dark  focus-visible:ring-offset-2"
      >
        <ContactIcon
          className={`h-7 w-7 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
        />
      </button>
    </div>
  )
}

export default Ballons
