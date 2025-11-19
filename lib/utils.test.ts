import { formatTimeAgo, getHostname, prefixUrl } from "@/lib/utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

describe("Utility Functions", () => {
  describe("prefixUrl", () => {
    it("adds https to a naked domain", () => {
      expect(prefixUrl("google.com")).toBe("https://google.com")
    })

    it("does not change http urls", () => {
      expect(prefixUrl("http://localhost:3000")).toBe("http://localhost:3000")
    })

    it("does not change https urls", () => {
      expect(prefixUrl("https://example.com")).toBe("https://example.com")
    })

    it("returns empty string for empty input", () => {
      expect(prefixUrl("")).toBe("")
    })
  })

  describe("getHostname", () => {
    it("extracts hostname from a standard URL", () => {
      expect(getHostname("https://www.google.com/search?q=test")).toBe(
        "www.google.com"
      )
    })

    it("extracts hostname from a naked domain", () => {
      expect(getHostname("github.com")).toBe("github.com")
    })

    it("returns null for invalid URLs", () => {
      expect(getHostname("not a url")).toBe(null)
    })
  })

  describe("formatTimeAgo", () => {
    beforeEach(() => {
      vi.useFakeTimers()
      // Set a fixed date: Jan 1, 2024, 12:00:00
      const date = new Date(2024, 0, 1, 12, 0, 0)
      vi.setSystemTime(date)
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it("returns 'just now' for less than a second ago", () => {
      const now = new Date()
      expect(formatTimeAgo(now.toISOString())).toBe("just now")
    })

    it("formats seconds correctly", () => {
      const date = new Date()
      date.setSeconds(date.getSeconds() - 30)
      expect(formatTimeAgo(date.toISOString())).toBe("30 seconds ago")
    })

    it("formats minutes correctly", () => {
      const date = new Date()
      date.setMinutes(date.getMinutes() - 5)
      expect(formatTimeAgo(date.toISOString())).toBe("5 minutes ago")
    })

    it("formats hours correctly", () => {
      const date = new Date()
      date.setHours(date.getHours() - 2)
      expect(formatTimeAgo(date.toISOString())).toBe("2 hours ago")
    })

    it("formats days correctly", () => {
      const date = new Date()
      date.setDate(date.getDate() - 3)
      expect(formatTimeAgo(date.toISOString())).toBe("3 days ago")
    })

    it("returns empty string for invalid dates", () => {
      expect(formatTimeAgo("invalid-date")).toBe("")
    })
  })
})
