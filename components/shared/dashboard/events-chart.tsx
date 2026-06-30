"use client"

import dynamic from "next/dynamic"
import { EventsChartPoint } from "@/app/actions/stats"

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

type Props = {
  data: EventsChartPoint[]
}

export function EventsChart({ data }: Props) {
  const options = {
    chart: {
      type: "bar" as const,
      toolbar: { show: false },
      fontFamily: "inherit",
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
    },
    yaxis: {
      labels: {
        formatter: (val: number) => Math.round(val).toString(),
      },
    },
    grid: {
      strokeDashArray: 4,
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
      y: {
        formatter: (val: number) => `${val} event${val === 1 ? "" : "s"}`,
      },
    },
  }

  const series = [
    {
      name: "Events",
      data: data.map((d) => d.count),
    },
  ]

  return <ApexChart options={options} series={series} type="bar" height={250} />
}