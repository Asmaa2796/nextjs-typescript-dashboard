"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useTheme } from "next-themes";
import type { ApexOptions } from "apexcharts";
import type { TimeOfDayChartData } from "@/app/actions/stats";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Props = {
  data: TimeOfDayChartData[];
};

const formatLabel = (dateStr: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return dateStr;
  const [year, month, day] = parts;
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
};

export function EventsTimeOfDayChart({ data }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const categories = useMemo(() => data.map((d) => d.date), [data]);

  const series = useMemo(
    () => [
      { name: "Morning (5am–12pm)", data: data.map((d) => d.morning) },
      { name: "Afternoon (12pm–5pm)", data: data.map((d) => d.afternoon) },
      { name: "Evening (5pm–5am)", data: data.map((d) => d.evening) },
    ],
    [data]
  );

  if (!data || data.length === 0) {
    return <div className="h-[350px] flex items-center justify-center text-muted-foreground">No data</div>;
  }

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 350,
      stacked: true,
      toolbar: { show: false },
      zoom: { enabled: false },
      background: isDark ? "#07131d" : "#ffffff",
    },
    colors: ["#0be35a", "#fdba74", "#a5b4fc"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 1.5 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.4, opacityTo: 0.6 },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      labels: {
        colors: isDark ? "#f8fafc" : "#334155",
      },
    },
    grid: {
      padding: {
        left: 5,
        right: 0,
      },
      borderColor: isDark ? "rgba(148, 163, 184, 0.25)" : "rgba(15, 23, 42, 0.12)",
    },
    xaxis: {
      type: "category",
      categories,
      tickPlacement: "on",
      labels: {
        formatter: formatLabel,
        style: {
          colors: isDark ? "#cbd5e1" : "#64748b",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? "#cbd5e1" : "#64748b",
        },
      },
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      x: {
        formatter: (_value, opts) => {
          const index = opts?.dataPointIndex;
          if (index === undefined) return "";
          const dateStr = categories[index];
          return formatLabel(dateStr);
        },
      },
      y: {
        formatter: (val) => `${val} event${val === 1 ? "" : "s"}`,
      },
    },
  };

  return <Chart options={options} series={series} type="area" height={350} />;
}