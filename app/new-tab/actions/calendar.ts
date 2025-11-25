"use server"

import type { ClientVEvent } from "@/types/new-tab"
import { fromZonedTime, toZonedTime } from "date-fns-tz"
import { unstable_cache as cache } from "next/cache"
import type { DateWithTimeZone, VEvent } from "node-ical"
import * as ical from "node-ical"

const UTC_TIMEZONE_ID = "Etc/UTC"
const MIN_OFFSET = -4
const MAX_OFFSET = 14

function buildZonedDate(eventStart: DateWithTimeZone, occurrence: Date): Date {
  const tz = eventStart.tz
  const effectiveTz = tz ?? UTC_TIMEZONE_ID

  const zonedStart = toZonedTime(eventStart, effectiveTz)
  const h = zonedStart.getHours()
  const m = zonedStart.getMinutes()
  const s = zonedStart.getSeconds()
  const ms = zonedStart.getMilliseconds()

  const y = occurrence.getFullYear()
  const mo = occurrence.getMonth()
  const d = occurrence.getDate()

  const dateInEventTz = new Date(y, mo, d, h, m, s, ms)

  return fromZonedTime(dateInEventTz, effectiveTz)
}

function _toClientVEvent(
  event: VEvent,
  isRecurring = false,
  occurrenceDate?: Date
): ClientVEvent | null {
  let start: Date
  let end: Date

  if (isRecurring) {
    start = buildZonedDate(event.start as DateWithTimeZone, occurrenceDate!)

    const durationMs = event.end.getTime() - event.start.getTime()
    end = new Date(start.getTime() + durationMs)
  } else {
    start = event.start
    end = event.end
  }

  if (!start || isNaN(start.getTime())) {
    console.error("Invalid start date generated for event:", event)
    return null
  }

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
    rangeStartLocal.setDate(rangeStartLocal.getDate() + MIN_OFFSET)
    rangeStartLocal.setHours(0, 0, 0, 0)

    const rangeEndLocal = new Date()
    rangeEndLocal.setDate(rangeEndLocal.getDate() + MAX_OFFSET)
    rangeEndLocal.setHours(23, 59, 59, 999)

    const allEvents = Object.values(cal).filter(
      (e) => e.type === "VEVENT"
    ) as VEvent[]

    const eventsInRange: ClientVEvent[] = []
    const modifiedEventKeys = new Set<string>()

    for (const event of allEvents) {
      if (!event.rrule || event.recurrenceid) {
        const eventStart = event.start
        const eventEnd: DateWithTimeZone | Date = event.end
          ? event.end
          : event.start

        if (eventStart <= rangeEndLocal && eventEnd >= rangeStartLocal) {
          if (event.recurrenceid) {
            const eventKey = `${event.uid}-${event.recurrenceid.getTime()}`
            modifiedEventKeys.add(eventKey)
          }

          if (event.status !== "CANCELLED") {
            const clientEvent = _toClientVEvent(event, false)
            if (clientEvent) eventsInRange.push(clientEvent)
          }
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

const getCachedCalendarEvents = cache(
  async (icalUrl: string) => {
    return _fetchEventsInRange(icalUrl)
  },
  ["calendar-events"],
  {
    revalidate: 150,
    tags: ["calendar"],
  }
)

export async function getInitialCalendarEvents(
  icalUrl: string | null
): Promise<ClientVEvent[]> {
  if (!icalUrl) return []
  return getCachedCalendarEvents(icalUrl)
}
