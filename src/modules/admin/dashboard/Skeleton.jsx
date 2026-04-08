const Skeleton = ({ rows = 3 }) => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-12 bg-neutral-light rounded-xl animate-pulse" />
    ))}
  </div>
)

export default Skeleton
