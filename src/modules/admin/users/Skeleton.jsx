const Skeleton = ({ rows = 5 }) => (
  <div className="flex flex-col divide-y divide-neutral-gray/60">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 py-4 px-5 animate-pulse">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-neutral-light flex-shrink-0" />
        {/* Nombre + email */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3.5 bg-neutral-light rounded-lg w-36" />
          <div className="h-3 bg-neutral-light rounded-lg w-52" />
        </div>
        {/* Teléfono */}
        <div className="h-3 bg-neutral-light rounded-lg w-24 hidden sm:block" />
        {/* Rol badge */}
        <div className="h-6 bg-neutral-light rounded-full w-28 hidden md:block" />
        {/* Estado */}
        <div className="h-6 bg-neutral-light rounded-full w-16 hidden lg:block" />
        {/* Acciones */}
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-lg bg-neutral-light" />
          <div className="w-8 h-8 rounded-lg bg-neutral-light" />
        </div>
      </div>
    ))}
  </div>
)

export default Skeleton
