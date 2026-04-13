const ContactRow = ({ icon, label, children }) => (
  <div className="flex items-start gap-4">
    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary-dark shrink-0 mt-0.5">
      {icon}
    </div>
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="font-sans text-xs font-semibold uppercase tracking-wider text-text-light/70">
        {label}
      </span>
      {children}
    </div>
  </div>
)

export default ContactRow
