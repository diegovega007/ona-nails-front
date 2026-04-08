const Skeleton = ({ rows = 5 }) => (
  <div className="flex flex-col divide-y divide-neutral-gray/60">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 py-4 px-5 animate-pulse">
        <div className="w-8 h-8 rounded-full bg-neutral-light flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3.5 bg-neutral-light rounded-lg w-40" />
          <div className="h-3 bg-neutral-light rounded-lg w-28" />
        </div>
        <div className="h-3 bg-neutral-light rounded-lg w-20 hidden sm:block" />
        <div className="h-6 bg-neutral-light rounded-full w-24 hidden md:block" />
        <div className="h-6 bg-neutral-light rounded-full w-20" />
      </div>
    ))}
  </div>
)

export default Skeleton
