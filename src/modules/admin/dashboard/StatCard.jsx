const StatCard = ({ label, value, Icon, iconBg, iconColor, loading }) => (
  <div className="bg-white border border-neutral-gray rounded-2xl p-5 flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <span className="font-sans text-[11px] font-semibold tracking-[1.5px] uppercase text-text-light">
        {label}
      </span>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
    </div>
    <span className="font-serif text-4xl font-semibold text-text-dark leading-none">
      {loading ? <span className="text-2xl text-text-light/40">—</span> : value}
    </span>
  </div>
)

export default StatCard
