"use server"

import type { ClientVEvent } from "@/types/new-tab"
import type { DateWithTimeZone, VEvent } from "node-ical"
import * as ical from "node-ical"

const UTC_TIMEZONE_ID = "Etc/UTC"

function buildZonedDate(eventStart: DateWithTimeZone, occurrence: Date): Date {
  const h = eventStart.getHours()
  const m = eventStart.getMinutes()
  const s = eventStart.getSeconds()

  const y = occurrence.getFullYear()
  const mo = occurrence.getMonth()
  const d = occurrence.getDate()

  const result = new Date(y, mo, d, h, m, s)
  return result
}

function _toClientVEvent(
  event: VEvent,
  isRecurring = false,
  occurrenceDate?: Date
): ClientVEvent | null {
  let start: Date

  if (isRecurring) {
    start = buildZonedDate(event.start as DateWithTimeZone, occurrenceDate!)
  } else {
    start = event.start
  }

  if (!start || isNaN(start.getTime())) {
    console.error("Invalid start date generated for event:", event)
    return null
  }
  if (isNaN(start.getTime())) {
    console.error("Invalid recurring start", { event, occurrenceDate })
  }

  const durationMs = event.end.getTime() - event.start.getTime()
  const end = new Date(start.getTime() + durationMs)

  const tz = (event.start as DateWithTimeZone).tz
  const finalTz = tz === UTC_TIMEZONE_ID || tz === undefined ? null : tz

  return {
    summary: event.summary,
    start: start.toISOString(),
    end: end.toISOString(),
    datetype: event.datetype as "date" | "datetime",
    tz: finalTz,
    location: event.location,
    description: event.description,
    url: typeof event.url === "string" ? event.url : undefined,
    uid: event.uid,
    recurrenceid: isRecurring ? start.toISOString() : undefined,
  }
}

const windowsToIana: { [key: string]: string } = {
  "FLE Standard Time": "Europe/Vilnius",
}

async function _fetchEventsInRange(icalUrl: string): Promise<ClientVEvent[]> {
  if (!icalUrl) return []

  try {
    const icalRes = await fetch(icalUrl)
    if (!icalRes.ok) {
      throw new Error(
        `Failed to fetch iCal feed with status: ${icalRes.status}`
      )
    }
    let icalText = await icalRes.text()

    for (const [windowsTzid, ianaTzid] of Object.entries(windowsToIana)) {
      const regex = new RegExp(`TZID:${windowsTzid}`, "g")
      icalText = icalText.replace(regex, `TZID:${ianaTzid}`)
    }

    const cal = ical.sync.parseICS(icalText)
    const rangeStartLocal = new Date()
    rangeStartLocal.setDate(rangeStartLocal.getDate() - 30)
    rangeStartLocal.setHours(0, 0, 0, 0)

    const rangeEndLocal = new Date()
    rangeEndLocal.setDate(rangeEndLocal.getDate() + 60)
    rangeEndLocal.setHours(23, 59, 59, 999)

    const allEvents = Object.values(cal).filter(
      (e) => e.type === "VEVENT"
    ) as VEvent[]

    const eventsInRange: ClientVEvent[] = []
    const modifiedEventKeys = new Set<string>()

    for (const event of allEvents) {
      if (!event.rrule && event.recurrenceid) {
        const eventStart = event.start
        const eventEnd: DateWithTimeZone | Date = event.end
          ? event.end
          : event.start

        if (eventStart <= rangeEndLocal && eventEnd >= rangeStartLocal) {
          const eventKey = `${event.uid}-${event.recurrenceid.getTime()}`
          modifiedEventKeys.add(eventKey)

          if (event.status !== "CANCELLED") {
            const clientEvent = _toClientVEvent(event, false)
            if (clientEvent) eventsInRange.push(clientEvent)
          }
        }
      } else if (!event.rrule && !event.recurrenceid) {
        const eventStart = event.start
        const eventEnd: DateWithTimeZone | Date = event.end
          ? event.end
          : event.start

        if (eventStart <= rangeEndLocal && eventEnd >= rangeStartLocal) {
          const clientEvent = _toClientVEvent(event, false)
          if (clientEvent) eventsInRange.push(clientEvent)
        }
      }
    }

    for (const event of allEvents) {
      if (event.status === "CANCELLED" || !event.rrule) continue

      const rule = event.rrule
      const occurrences = rule.between(rangeStartLocal, rangeEndLocal)

      for (const occurrenceDate of occurrences) {
        const eventKey = `${event.uid}-${occurrenceDate.getTime()}`
        if (modifiedEventKeys.has(eventKey)) {
          continue
        }

        const clientEvent = _toClientVEvent(event, true, occurrenceDate)
        if (clientEvent) eventsInRange.push(clientEvent)
      }
    }

    return eventsInRange.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    )
  } catch (error) {
    console.error("Failed to fetch or parse iCal URL:", error)
    return []
  }
}

export async function getInitialCalendarEvents(
  icalUrl: string | null
): Promise<ClientVEvent[]> {
  if (!icalUrl) return []
  return _fetchEventsInRange(icalUrl)
}
