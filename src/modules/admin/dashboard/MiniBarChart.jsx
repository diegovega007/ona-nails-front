const MiniBarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="flex items-end gap-2 h-28 w-full">
      {data.map(({ label, count }) => (
        <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
          {count > 0 && (
            <span className="font-sans text-[10px] text-text-light">{count}</span>
          )}
          <div className="w-full flex items-end flex-1">
            <div
              className="w-full bg-primary/25 hover:bg-primary/40 rounded-t-lg transition-all duration-500"
              style={{ height: count === 0 ? '4px' : `${Math.max((count / max) * 100, 8)}%` }}
            />
          </div>
          <span className="font-sans text-[10px] text-text-light capitalize">{label}</span>
        </div>
      ))}
    </div>
  )
}

export default MiniBarChart
