const BAR_MAX_PX = 72

const MiniBarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="flex items-end gap-2 h-28 w-full">
      {data.map(({ label, count }) => (
        <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
          <div className="w-full flex items-end relative group" style={{ height: `${BAR_MAX_PX}px` }}>
            <div
              className="w-full bg-primary/25 hover:bg-primary/40 rounded-t-lg transition-all duration-500"
              style={{ height: count === 0 ? '4px' : `${Math.max((count / max) * BAR_MAX_PX, 6)}px` }}
            />
            {count > 0 && (
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-sans text-[10px] text-white bg-gray-700 rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {count} cita{count > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <span className="font-sans text-[10px] text-text-light capitalize">{label}</span>
        </div>
      ))}
    </div>
  )
}

export default MiniBarChart
