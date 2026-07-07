"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Event } from "@/lib/types/event.types"
import EventFormModal from "@/components/shared/events/event-form-modal"
import { EventDetailModal } from "@/components/shared/events/event-detail-modal"
import { EventDeleteModal } from "@/components/shared/events/event-delete-modal"

type Modal = "none" | "add" | "detail" | "edit" | "delete"

const DAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
]

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function EventsCalendar({ events }: { events: Event[] }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [modal, setModal] = useState<Modal>("none")
  const [selected, setSelected] = useState<Event | null>(null)

  const firstDay = new Date(year, month, 1).getDay()
  const daysCount = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysCount }, (_, i) => i + 1),
  ]

  function eventsForDay(day: number): Event[] {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return events.filter(
      (e) => e.date_from <= date && date <= e.date_to
    )
  }

  function prevMonth() {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else {
      setMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  function openDetail(e: Event) {
    setSelected(e)
    setModal("detail")
  }

  function openEdit() {
    setModal("edit")
  }

  function openDelete() {
    setModal("delete")
  }

  function closeAll() {
    setModal("none")
    setSelected(null)
  }

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Button size="sm" onClick={() => setModal("add")} className="cursor-pointer dark:bg-[#09161f] dark:text-sky-600">
          Add Event
          <Plus className="w-4 h-4 mr-1" />
        </Button>

        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-1 hover:bg-muted rounded-md transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="font-medium text-base min-w-32 text-center">
            {MONTHS[month]} {year}
          </span>

          <button
            onClick={nextMonth}
            className="p-1 hover:bg-muted rounded-md transition cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 border-t border-l border-border bg-white dark:bg-[#09161f]">
        {cells.map((day, i) => {
          const dayEvents = day ? eventsForDay(day) : []

          return (
            <div
              key={i}
              className={`min-h-24 border-b border-r border-border p-1 flex flex-col ${
                !day ? "bg-muted/30" : ""
              }`}
            >
              {day && (
                <>
                  <span
                    className={`text-xs w-6 h-6 flex items-center justify-center rounded-full mb-1 font-medium ${
                      isToday(day)
                        ? "bg-blue-700 text-white"
                        : "text-foreground"
                    }`}
                  >
                    {day}
                  </span>

                  <div className="flex flex-col gap-0.5">
                    {dayEvents.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => openDetail(ev)}
                        className="w-full text-left text-xs px-1.5 py-0.5 rounded truncate font-medium hover:opacity-80 transition-opacity cursor-pointer"
                        style={{
                          backgroundColor: ev.highlight + "33",
                          color: ev.highlight,
                          borderLeft: `3px solid ${ev.highlight}`,
                        }}
                      >
                        {ev.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* modals */}
      <EventFormModal
        open={modal === "add" || modal === "edit"}
        event={modal === "edit" ? selected : null}
        onclose={closeAll}
      />

      <EventDetailModal
        open={modal === "detail"}
        event={selected}
        onClose={closeAll}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      <EventDeleteModal
        open={modal === "delete"}
        event={selected}
        onClose={closeAll}
      />
    </>
  )
}