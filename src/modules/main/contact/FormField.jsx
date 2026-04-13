const inputClass =
  'w-full px-4 py-3 rounded-xl border border-neutral-gray/60 bg-background font-sans text-sm text-text-dark placeholder:text-text-light/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all'

const FormField = ({ label, id, ...inputProps }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="font-sans text-sm font-medium text-text-dark">
      {label}
    </label>
    <input id={id} className={inputClass} {...inputProps} />
  </div>
)

export default FormField
