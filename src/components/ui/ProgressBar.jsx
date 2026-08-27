export default function ProgressBar({ value, max, colorClass, showLabel = true, height = 'h-2' }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const getColor = () => {
    if (colorClass) return colorClass
    if (pct >= 90) return 'bg-red-500'
    if (pct >= 70) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  return (
    <div className="w-full">
      <div className={`w-full ${height} bg-slate-800 rounded-full overflow-hidden`}>
        <div
          className={`${height} ${getColor()} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-slate-400 mt-1">{pct.toFixed(0)}%</p>
      )}
    </div>
  )
}
