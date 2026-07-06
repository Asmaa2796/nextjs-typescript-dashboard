"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { PostsStatusStats } from "@/app/actions/stats"

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

type Props = {
  stats: PostsStatusStats
}

export function PostsStatusChart({ stats }: Props) {
  const [open, setOpen] = useState(false)

  const options = {
    chart: {
      type: "radialBar" as const,
      fontFamily: "inherit",
    },
    plotOptions: {
      radialBar: {
        hollow: { size: "60%" },
        track: {
          background: "#E6F1FB",
        },
        dataLabels: {
          show: true,
          name: { show: false },
          value: {
            fontSize: "28px",
            fontWeight: 600,
            offsetY: 8,
            formatter: () => `${stats.activePercentage}%`,
          },
        },
      },
    },
    fill: {
      colors: ["oklch(88.2% 0.059 254.128)"],
    },
    stroke: { lineCap: "round" as const },
    labels: ["Active posts"],
  }

  const series = [stats.activePercentage]

  return (
    <div className="max-w-xl w-full rounded-xl border bg-white dark:bg-[#102A3D] p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h5 className="text-xl font-semibold text-slate-600">Posts status</h5>
      </div>

     <div>
      <div className="grid grid-cols-2 gap-3">
        <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                {stats.active}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">Active</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
        </div>

        <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1 bg-rose-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                {stats.inactive}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">Inactive</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          </div>
        </div>
      </div>
    </div>

      <div className="py-6">
        <ApexChart options={options} series={series} type="radialBar" height={200} />
      </div>
      <div className="border-t pt-4 text-sm text-muted-foreground">
          Total post{stats.total === 1 ? "" : "s"}: {""}
          <span className="font-semibold text-foreground">
            {stats.total}
          </span>
      </div>
    </div>
  )
}