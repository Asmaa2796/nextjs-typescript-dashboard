import { getEvents } from "@/app/actions/events"
import { EventsCalendar } from "@/components/shared/events/events-calendar"

export default async function EventsPage() {
  const events = await getEvents()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium">Events Calendar</h1>
      </div>
      <EventsCalendar events={events} />
    </div>
  )
}