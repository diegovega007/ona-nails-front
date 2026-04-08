const EnabledBadge = ({ enabled }) => {
  const cfg = enabled
    ? { label: 'Activo',    cls: 'bg-emerald-50 text-emerald-600 ring-emerald-200' }
    : { label: 'Inactivo',  cls: 'bg-neutral-100 text-text-light ring-neutral-200' }

  return (
    <span className={`inline-flex items-center gap-1.5 font-sans text-xs font-medium px-2.5 py-1 rounded-full ring-1 ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
      {cfg.label}
    </span>
  )
}

export default EnabledBadge
