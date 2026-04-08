export const STATUS = {
  received:    { label: 'Pendiente',   bg: 'bg-amber-50',   text: 'text-amber-600',   dot: 'bg-amber-400',   border: 'border-amber-200'   },
  in_progress: { label: 'En progreso', bg: 'bg-blue-50',    text: 'text-blue-600',    dot: 'bg-blue-400',    border: 'border-blue-200'    },
  done:        { label: 'Completada',  bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400', border: 'border-emerald-200' },
  cancelled:   { label: 'Cancelada',   bg: 'bg-red-50',     text: 'text-red-500',     dot: 'bg-red-400',     border: 'border-red-200'     },
}

const StatusBadge = ({ status }) => {
  const s = STATUS[status] ?? STATUS.received
  return (
    <span className={`inline-flex items-center gap-1.5 font-sans text-[11px] font-medium px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

export default StatusBadge
