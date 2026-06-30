"use server"

import { supabase } from "@/lib/supabase";

export type DashboardStats = {
    totalPosts: number
    totalUsers: number
    totalEvents: number
}

export type EventsChartPoint = {
  date: string 
  label: string
  count: number
}

export type PostsStatusStats = {
  active: number
  inactive: number
  total: number
  activePercentage: number
}

export async function getDashboardStats(): Promise<DashboardStats> {

  const [postsRes, eventsRes] = await Promise.all([
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
  ])

  if (postsRes.error) throw new Error(postsRes.error.message)
  if (eventsRes.error) throw new Error(eventsRes.error.message)

  
  const totalUsers = 0

  return {
    totalPosts: postsRes.count ?? 0,
    totalUsers,
    totalEvents: eventsRes.count ?? 0,
  }
}

export async function getEventsChartData(): Promise<EventsChartPoint[]> {

  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)

  const fromDate = sevenDaysAgo.toISOString().slice(0, 10)
  const toDate = today.toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from("events")
    .select("date_from")
    .gte("date_from", fromDate)
    .lte("date_from", toDate)

  if (error) throw new Error(error.message)

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const buckets = new Map<string, EventsChartPoint>()

  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo)
    d.setDate(sevenDaysAgo.getDate() + i)
    const dateStr = d.toISOString().slice(0, 10)
    buckets.set(dateStr, {
      date: dateStr,
      label: dayLabels[d.getDay()],
      count: 0,
    })
  }

  data?.forEach((row) => {
    const bucket = buckets.get(row.date_from)
    if (bucket) bucket.count += 1
  })

  return Array.from(buckets.values())
}

export async function getPostsStatusStats(): Promise<PostsStatusStats> {

  const [activeRes, inactiveRes] = await Promise.all([
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("active", true),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("active", false),
  ])

  if (activeRes.error) throw new Error(activeRes.error.message)
  if (inactiveRes.error) throw new Error(inactiveRes.error.message)

  const active = activeRes.count ?? 0
  const inactive = inactiveRes.count ?? 0
  const total = active + inactive

  return {
    active,
    inactive,
    total,
    activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
  }
}
export type TimeOfDayChartData = {
  date: string;
  morning: number;
  afternoon: number;
  evening: number;
};

export async function getEventsTimeOfDayChartData(): Promise<
  TimeOfDayChartData[]
> {
  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoStr = formatDate(sevenDaysAgo);

  const { data, error } = await supabase
    .from("events")
    .select("date_from, time_from")
    .gte("date_from", sevenDaysAgoStr);

  if (error) throw error;

  const days: Record<
    string,
    {
      morning: number;
      afternoon: number;
      evening: number;
    }
  > = {};

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);

    const key = formatDate(d);

    days[key] = {
      morning: 0,
      afternoon: 0,
      evening: 0,
    };
  }

  data?.forEach((event) => {
    const dayKey = event.date_from;

    if (!days[dayKey]) return;

    const hour = parseInt(
      event.time_from.split(":")[0],
      10
    );

    if (hour >= 5 && hour < 12) {
      days[dayKey].morning += 1;
    } else if (hour >= 12 && hour < 17) {
      days[dayKey].afternoon += 1;
    } else {
      days[dayKey].evening += 1;
    }
  });

  return Object.entries(days).map(([date, counts]) => ({
    date,
    ...counts,
  }));
}