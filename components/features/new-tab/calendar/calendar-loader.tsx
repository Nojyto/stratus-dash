import { getInitialCalendarEvents } from "@/app/new-tab/actions/calendar"
import { CalendarWidget } from "./calendar-widget"

export async function CalendarLoader({ icalUrl }: { icalUrl: string | null }) {
  const hasCalendar = !!icalUrl
  const initialEvents = await getInitialCalendarEvents(icalUrl)

  return (
    <CalendarWidget initialEvents={initialEvents} hasCalendar={hasCalendar} />
  )
}
