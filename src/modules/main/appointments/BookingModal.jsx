import { useState, useEffect, useRef } from 'react'
import serviceService from '../../../services/service_service'
import appointmentService from '../../../services/appointment_service'
import ModalHeader from './ModalHeader'
import ModalFooter from './ModalFooter'
import StepService from './StepService'
import StepPersonalInfo from './StepPersonalInfo'
import StepDateTime from './StepDateTime'
import SuccessView from './SuccessView'

const emptyForm = {
  name:           '',
  last_name:      '',
  cellphone:      '',
  email:          '',
  date:           '',
  time:           '',
  detail_service: '',
}

export default function BookingModal({ isOpen, onClose }) {
  const [step, setStep]               = useState(1)
  const [services, setServices]       = useState([])
  const [loadingSvc, setLoadingSvc]   = useState(true)
  const [selectedSvcs, setSelectedSvcs] = useState([])  // array de servicios seleccionados
  const [form, setForm]               = useState(emptyForm)
  const [errors, setErrors]           = useState({})
  const [submitting, setSubmitting]   = useState(false)
  const [success, setSuccess]         = useState(false)
  const [apiError, setApiError]       = useState('')
  const overlayRef                    = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    setLoadingSvc(true)
    serviceService.getAll()
      .then(data => setServices(data.filter(s => s.enabled)))
      .finally(() => setLoadingSvc(false))
  }, [isOpen])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const resetAll = () => {
    setStep(1)
    setSelectedSvcs([])
    setForm(emptyForm)
    setErrors({})
    setApiError('')
    setSuccess(false)
  }

  const handleClose = () => { resetAll(); onClose() }

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) handleClose()
  }

  const setField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: '' }))
  }

  // Alterna la selección de un servicio en el array
  const handleToggleService = (svc) => {
    setSelectedSvcs(prev => {
      const exists = prev.some(s => s.id === svc.id)
      return exists ? prev.filter(s => s.id !== svc.id) : [...prev, svc]
    })
  }

  // ── Validaciones ────────────────────────────────────────────────────────────
  const validateStep2 = () => {
    const errs = {}
    if (!form.name.trim())      errs.name      = 'El nombre es requerido'
    if (!form.last_name.trim()) errs.last_name = 'El apellido es requerido'
    if (!form.cellphone.trim()) errs.cellphone = 'El teléfono es requerido'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email inválido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateStep3 = () => {
    const errs = {}
    if (!form.date) errs.date = 'Selecciona una fecha'
    if (!form.time) errs.time = 'Selecciona un horario'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (step === 2 && !validateStep2()) return
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    if (!validateStep3()) return
    setSubmitting(true)
    setApiError('')
    try {
      const [hours, minutes] = form.time.split(':')
      const dt = new Date(`${form.date}T${hours.padStart(2,'0')}:${minutes.padStart(2,'0')}:00`)

      await appointmentService.create({
        list_services: selectedSvcs.map(s => s.id),
        client: {
          name:      form.name.trim(),
          last_name: form.last_name.trim(),
          cellphone: form.cellphone.trim(),
          email:     form.email.trim() || undefined,
        },
        appointment_date: dt.toISOString(),
        detail_service:   form.detail_service.trim() || undefined,
        status:           'received',
      })
      setSuccess(true)
    } catch (err) {
      setApiError(err.message ?? 'Ocurrió un error al reservar. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(30,20,10,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}
      >
        <ModalHeader step={step} success={success} onClose={handleClose} />

        <div className="flex-1 overflow-y-auto min-h-0 px-8 py-6">
          {success ? (
            <SuccessView
              serviceName={selectedSvcs.map(s => s.name).join(', ')}
              date={form.date}
              time={form.time}
              onClose={handleClose}
            />
          ) : step === 1 ? (
            <StepService
              services={services}
              loading={loadingSvc}
              selected={selectedSvcs}
              onToggle={handleToggleService}
            />
          ) : step === 2 ? (
            <StepPersonalInfo
              form={form}
              errors={errors}
              onChange={setField}
            />
          ) : (
            <StepDateTime
              form={form}
              errors={errors}
              onChange={setField}
              apiError={apiError}
            />
          )}
        </div>

        {!success && (
          <ModalFooter
            step={step}
            selectedSvc={selectedSvcs.length > 0 ? selectedSvcs[0] : null}
            submitting={submitting}
            onBack={() => setStep(s => s - 1)}
            onNext={handleNext}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  )
}
