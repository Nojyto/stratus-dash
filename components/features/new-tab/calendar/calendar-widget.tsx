"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ClientVEvent } from "@/types/new-tab"
import {
  AlignLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

type CalendarWidgetProps = {
  initialEvents: ClientVEvent[]
  hasCalendar: boolean
}

const MIN_OFFSET = -4
const MAX_OFFSET = 14

function formatEventTime(
  startStr: string,
  endStr: string,
  isAllDay: boolean,
  tz: string | undefined | null
) {
  if (isAllDay) {
    return "All-day"
  }

  const effectiveTimeZone = tz || undefined
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
    timeZone: effectiveTimeZone,
  }

  if (effectiveTimeZone) {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: effectiveTimeZone })
    } catch {
      options.timeZone = undefined
    }
  }

  const start = new Date(startStr)
  const end = new Date(endStr)

  const startTime = start.toLocaleTimeString("en-US", options)
  const endTime = end.toLocaleTimeString("en-US", options)

  return `${startTime} - ${endTime}`.replace(/ /g, " ")
}

function getDayLabel(dayOffset: number): string {
  if (dayOffset === 0) return "Today"
  if (dayOffset === 1) return "Tomorrow"
  if (dayOffset === -1) return "Yesterday"

  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + dayOffset)
  return targetDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

function EventItem({ event, now }: { event: ClientVEvent; now: Date }) {
  const hasUrl = !!event.url
  const Comp = hasUrl ? "a" : "div"

  const eventStart = new Date(event.start)
  const eventEnd = new Date(event.end)
  const isAllDay = event.datetype === "date"

  const isPast = !isAllDay && eventEnd < now
  const isCurrent = !isAllDay && eventStart <= now && eventEnd > now

  const linkProps = hasUrl
    ? {
        href: event.url ?? undefined,
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {}

  return (
    <Comp
      {...linkProps}
      className={cn(
        "group rounded-md p-1.5 transition-colors",
        hasUrl && "cursor-pointer hover:bg-secondary/75",
        isPast && "opacity-50"
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 overflow-hidden">
          <p
            className={cn(
              "truncate text-sm",
              hasUrl && "group-hover:underline",
              isCurrent ? "font-bold" : "font-medium"
            )}
          >
            {event.summary}
          </p>
          <p
            className={cn(
              "text-xs",
              isCurrent ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {formatEventTime(event.start, event.end, isAllDay, event.tz)}
          </p>
          {event.location && (
            <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </p>
          )}
          {event.description && (
            <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
              <AlignLeft className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{event.description}</span>
            </p>
          )}
        </div>
      </div>
    </Comp>
  )
}

function filterEventsForDay(
  allEvents: ClientVEvent[],
  dayOffset: number
): ClientVEvent[] {
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + dayOffset)

  const targetDayStart = new Date(targetDate)
  targetDayStart.setHours(0, 0, 0, 0)

  const targetDayEnd = new Date(targetDate)
  targetDayEnd.setHours(23, 59, 59, 999)

  const todaysEvents: ClientVEvent[] = []

  for (const event of allEvents) {
    const eventStart = new Date(event.start)
    const eventEnd = event.end ? new Date(event.end) : eventStart

    if (eventStart <= targetDayEnd && eventEnd > targetDayStart) {
      todaysEvents.push(event)
    }
  }

  return todaysEvents.sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  )
}

export function CalendarWidget({
  initialEvents,
  hasCalendar,
}: CalendarWidgetProps) {
  const [allEvents] = useState(initialEvents)
  const [dayOffset, setDayOffset] = useState(0)
  const [now, setNow] = useState<Date | null>(null)

  const events = useMemo(() => {
    return filterEventsForDay(allEvents, dayOffset)
  }, [allEvents, dayOffset])

  const handleChangeDay = (offset: number) => {
    setDayOffset(offset)
  }

  useEffect(() => {
    setNow(new Date())
  }, [])

  if (!hasCalendar) {
    return (
      <div className="w-full max-w-lg xl:w-64">
        <div className="flex h-fit min-h-[240px] w-full flex-col items-center justify-center gap-2 rounded-lg bg-secondary/50 p-4 text-center text-xs text-muted-foreground backdrop-blur-sm">
          <Calendar className="h-6 w-6" />
          <p>Add your iCal URL in settings to see today&apos;s events.</p>
        </div>
      </div>
    )
  }

  const hasEvents = events.length > 0
  const dayLabel = getDayLabel(dayOffset)

  return (
    <div className="w-full max-w-lg xl:w-64">
      <div className="flex h-fit max-h-[500px] w-full flex-col overflow-hidden rounded-lg bg-secondary/50 p-4 backdrop-blur-sm">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="truncate font-medium">{dayLabel}</h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleChangeDay(dayOffset - 1)}
              disabled={dayOffset <= MIN_OFFSET}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleChangeDay(0)}
              disabled={dayOffset === 0}
            >
              <Calendar className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleChangeDay(dayOffset + 1)}
              disabled={dayOffset >= MAX_OFFSET}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex min-h-[160px] flex-col gap-0.5 overflow-y-auto">
          {!hasEvents ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4 text-center text-xs text-muted-foreground">
              <p>No events scheduled for this day.</p>
            </div>
          ) : (
            events.map((event) => (
              <EventItem
                key={`${event.uid}-${
                  event.recurrenceid ?? new Date(event.start).getTime()
                }`}
                event={event}
                now={now ?? new Date(0)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
