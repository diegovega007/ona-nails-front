export function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-sans text-[13px] font-medium text-neutral-dark">{label}</label>
      {children}
      {error && <p className="font-sans text-xs text-red-500">{error}</p>}
    </div>
  )
}

export const inputClass = (error) =>
  `w-full h-12 px-4 rounded-[10px] border-[1.5px] font-sans text-sm text-text-dark placeholder:text-neutral-dark/40 outline-none transition-colors duration-200 ${
    error
      ? 'border-red-400 bg-red-50 focus:border-red-500'
      : 'border-neutral-gray bg-neutral-light focus:border-primary'
  }`
