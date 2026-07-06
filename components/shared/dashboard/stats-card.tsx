import { LucideIcon, ChartNoAxesCombined } from "lucide-react"

type Props = {
  label: string
  value: number | string
  icon: LucideIcon
  iconColorClass: string
  iconBgClass: string
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  iconColorClass,
  iconBgClass,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-6 pb-5 pt-6 dark:border-gray-800 dark:bg-[#102A3D]">
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full ${iconBgClass} ${iconColorClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm text-gray-500 dark:text-gray-400">
            {label}
          </h3>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          {value}
        </h4>

        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full ${iconColorClass}`}
        >
          <ChartNoAxesCombined strokeWidth={1} className="h-7 w-7" />
        </span>
      </div>
    </div>
  )
}