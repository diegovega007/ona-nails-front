const ROLES = {
  admin: {
    label: 'Administrador',
    cls: 'bg-primary/15 text-primary-dark border border-primary/30',
    dot: 'bg-primary-dark',
  },
  receptionist: {
    label: 'Recepcionista',
    cls: 'bg-neutral-100 text-neutral-dark border border-neutral-gray',
    dot: 'bg-neutral-dark',
  },
  employee: {
    label: 'Empleado',
    cls: 'bg-neutral-100 text-neutral-dark border border-neutral-gray',
    dot: 'bg-neutral-dark',
  },
}

const RoleBadge = ({ rol }) => {
  const config = ROLES[rol] ?? {
    label: rol ?? 'Sin rol',
    cls: 'bg-neutral-100 text-text-light border border-neutral-gray',
    dot: 'bg-text-light',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 font-sans text-[11px] font-medium px-2.5 py-1 rounded-full ${config.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  )
}

export default RoleBadge
