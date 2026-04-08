import CalendarIcon from '../../../assets/icons/calendarIcon'

const EmptyState = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
      <CalendarIcon className="w-6 h-6 text-primary-dark opacity-50" />
    </div>
    <p className="font-sans text-sm text-text-light/60">{text}</p>
  </div>
)

export default EmptyState
