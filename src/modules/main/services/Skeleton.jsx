const Skeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-soft animate-pulse">
    <div className="aspect-video bg-neutral-light" />
    <div className="p-6 flex flex-col gap-3">
      <div className="h-4 bg-neutral-light rounded-lg w-3/4" />
      <div className="h-3 bg-neutral-light rounded-lg w-full" />
      <div className="h-3 bg-neutral-light rounded-lg w-5/6" />
      <div className="h-6 bg-neutral-light rounded-full w-24 mt-2" />
    </div>
  </div>
)

export default Skeleton
