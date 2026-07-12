"use client"

import dynamic from "next/dynamic"
import { useMemo } from "react"
import { useTheme } from "next-themes"
import type { ApexOptions } from "apexcharts"
import { EventsChartPoint } from "@/app/actions/stats"

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

type Props = {
  data: EventsChartPoint[]
}

export function EventsChart({ data }: Props) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const options: ApexOptions = useMemo(() => {
    const textColor = isDark ? "#f8fafc" : "#334155"
    const axisColor = isDark ? "#cbd5e1" : "#64748b"
    const gridColor = isDark ? "rgba(148, 163, 184, 0.25)" : "rgba(15, 23, 42, 0.12)"

    return {
      chart: {
        type: "bar",
        toolbar: { show: false },
        fontFamily: "inherit",
        background: isDark ? "#07131d" : "#ffffff",
      },
      plotOptions: {
        bar: {
          borderRadius: 7,
          columnWidth: "45%",
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: data.map((d) => d.label),
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            colors: axisColor,
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: axisColor,
          },
          formatter: (val: number) => Math.round(val).toString(),
        },
      },
      grid: {
        strokeDashArray: 4,
        borderColor: gridColor,
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "vertical",
          shadeIntensity: 0.4,
          gradientToColors: ["oklch(88.2% 0.059 254.128)"],
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.85,
          stops: [0, 100],
        },
      },
      colors: ["oklch(88.2% 0.059 254.128)"],
      tooltip: {
        theme: isDark ? "dark" : "light",
        y: {
          formatter: (val: number) => `${val} event${val === 1 ? "" : "s"}`,
        },
      },
      legend: {
        labels: {
          colors: textColor,
        },
      },
    }
  }, [data, isDark])

  const series = [
    {
      name: "Events",
      data: data.map((d) => d.count),
    },
  ]

  return <ApexChart options={options} series={series} type="bar" height={250} />
}