import CalendarIcon from '../../assets/icons/calendarIcon'

const Citas = () => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-4 p-8">
    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
      <CalendarIcon className="w-8 h-8 text-primary-dark opacity-60" />
    </div>
    <p className="font-serif text-2xl text-text-dark/30">Citas</p>
    <p className="font-sans text-sm text-text-light/60">Módulo en construcción</p>
  </div>
)

export default Citas
