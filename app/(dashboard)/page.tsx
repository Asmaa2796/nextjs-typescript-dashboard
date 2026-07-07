import { Calendar, FileText, Users } from "lucide-react";
import {
  getDashboardStats,
  getEventsChartData,
  getPostsStatusStats,
  getEventsTimeOfDayChartData,
} from "@/app/actions/stats";
import { StatsCard } from "@/components/shared/dashboard/stats-card";
import { EventsChart } from "@/components/shared/dashboard/events-chart";
import { PostsStatusChart } from "@/components/shared/dashboard/posts-status-chart";
import { EventsTimeOfDayChart } from "@/components/shared/dashboard/events-time-of-day-chart";

export default async function DashboardPage() {
  const [stats, chartData, postsStatus, timeOfDayData] = await Promise.all([
    getDashboardStats(),
    getEventsChartData(),
    getPostsStatusStats(),
    getEventsTimeOfDayChartData(),
  ]);
  const totalEventsThisWeek = chartData.reduce(
    (sum, day) => sum + day.count,
    0
  );

  return (
    <div>
      <h1 className="text-3xl text-slate-600 font-medium mb-8">Dashboard</h1>

      <div className="grid gap-5 md:grid-cols-3 mb-8">
        <StatsCard
          label="Total posts"
          value={stats.totalPosts}
          icon={FileText}
          iconColorClass="text-green-600 dark:text-green-400"
          iconBgClass="bg-green-100 dark:bg-green-950"
        />
        <StatsCard
          label="Total events"
          value={stats.totalEvents}
          icon={Calendar}
          iconColorClass="text-orange-600 dark:text-orange-400"
          iconBgClass="bg-orange-100 dark:bg-orange-950"
        />
        <StatsCard
          label="Total users"
          value={stats.totalUsers}
          icon={Users}
          iconColorClass="text-sky-600 dark:text-sky-400"
          iconBgClass="bg-sky-100 dark:bg-sky-950"
        />
      </div>

      <div>
        <div className="grid gap-5 md:grid-cols-2 mb-8">
          <div className="rounded-xl border bg-white dark:bg-[#09161f] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Events created</p>
                <h3 className="text-lg font-semibold text-slate-600">Last 7 days</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Daily event activity over the past week
                </p>
              </div>
            </div>
            <EventsChart data={chartData} />
            <div className="border-t pt-4 text-sm text-muted-foreground">
              Total this week:{" "}
              <span className="font-semibold text-foreground">
                {totalEventsThisWeek}
              </span>
            </div>
          </div>
          <div>
            <PostsStatusChart stats={postsStatus} />
          </div>
        </div>
        <div>
          <div className="rounded-xl border bg-white dark:bg-[#09161f] p-6">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Events by time of day</p>
              <h3 className="text-lg font-semibold text-slate-600 my-2">Last 7 days</h3>
              <p className="flex items-center text-sm text-muted-foreground">
               <span className="w-3 h-3 mr-1 bg-yellow-200"></span> Events are grouped into morning (5am–12pm), afternoon (12pm–5pm), and evening (5pm–5am).
              </p>
            </div>
            <EventsTimeOfDayChart data={timeOfDayData} />
          </div>
        </div>
      </div>
    </div>
  );
}