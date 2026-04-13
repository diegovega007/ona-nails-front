import { CONTACT_INFO, WHATSAPP_NUMBER } from './contactData'
import ContactRow from './ContactRow'
import MailIcon from '../../../assets/icons/mailIcon'
import ClockIcon from '../../../assets/icons/clockIcon'
import PhoneIcon from '../../../assets/icons/phoneIcon'
import MapPinIcon from '../../../assets/icons/mapPinIcon'
import WhatsappIcon from '../../../assets/icons/whatsappIcon'
import InstagramIcon from '../../../assets/icons/instagramIcon'

const whatsappMessage = encodeURIComponent(
  '¡Hola! Me gustaría obtener más información sobre sus servicios de Ona Nails.'
)
const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`

const ContactInfo = () => (
  <div className="flex flex-col gap-8">

    <div className="bg-white rounded-3xl shadow-soft border border-neutral-gray/40 p-8">
      <h2 className="font-serif text-2xl font-bold text-text-dark mb-7">
        Información de contacto
      </h2>

      <div className="flex flex-col gap-5">
        <ContactRow icon={<MapPinIcon className="w-5 h-5" />} label="Dirección">
          <span className="font-sans text-sm text-text-light leading-relaxed">
            {CONTACT_INFO.address}
          </span>
        </ContactRow>

        <ContactRow icon={<PhoneIcon className="w-5 h-5" />} label="Teléfono">
          <a
            href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`}
            className="font-sans text-sm text-text-light hover:text-primary-dark transition-colors"
          >
            {CONTACT_INFO.phone}
          </a>
        </ContactRow>

        <ContactRow icon={<MailIcon className="w-5 h-5" />} label="Correo">
          <a
            href={`mailto:${CONTACT_INFO.email}`}
            className="font-sans text-sm text-text-light hover:text-primary-dark transition-colors break-all"
          >
            {CONTACT_INFO.email}
          </a>
        </ContactRow>

        <ContactRow icon={<InstagramIcon className="w-5 h-5" />} label="Instagram">
          <a
            href={`https://instagram.com/${CONTACT_INFO.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-sm text-text-light hover:text-primary-dark transition-colors"
          >
            {CONTACT_INFO.instagram}
          </a>
        </ContactRow>

        <div className="h-px bg-neutral-gray/60 my-1" />

        <ContactRow icon={<ClockIcon className="w-5 h-5" />} label="Horarios">
          <div className="flex flex-col gap-1.5">
            {CONTACT_INFO.hours.map(h => (
              <div key={h.days} className="flex items-center justify-between gap-4">
                <span className="font-sans text-sm text-text-light">{h.days}</span>
                <span className="font-sans text-sm font-medium text-text-dark whitespace-nowrap">
                  {h.time}
                </span>
              </div>
            ))}
          </div>
        </ContactRow>
      </div>
    </div>

    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold text-base rounded-2xl shadow-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
    >
      <WhatsappIcon className="w-6 h-6" />
      Escríbenos por WhatsApp
    </a>

    <p className="font-sans text-xs text-text-light text-center leading-relaxed">
      También puedes seguirnos en Instagram{' '}
      <a
        href={`https://instagram.com/${CONTACT_INFO.instagram.replace('@', '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-dark font-medium hover:underline"
      >
        {CONTACT_INFO.instagram}
      </a>{' '}
      para ver nuestros diseños más recientes.
    </p>
  </div>
)

export default ContactInfo
