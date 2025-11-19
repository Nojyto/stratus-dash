import { renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useDebounce } from "./use-debounce"

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("should debounce the function call", () => {
    const func = vi.fn()
    const { result } = renderHook(() => useDebounce(func, 1000))
    const debouncedFunc = result.current

    // Call multiple times rapidly
    debouncedFunc("test1")
    debouncedFunc("test2")
    debouncedFunc("test3")

    // Should not execute immediately
    expect(func).not.toHaveBeenCalled()

    // Fast forward time partially (500ms)
    vi.advanceTimersByTime(500)
    expect(func).not.toHaveBeenCalled()

    // Fast forward past delay (another 500ms)
    vi.advanceTimersByTime(500)

    // Should be called once with the last argument
    expect(func).toHaveBeenCalledTimes(1)
    expect(func).toHaveBeenCalledWith("test3")
  })

  it("should reset timer on subsequent calls", () => {
    const func = vi.fn()
    const { result } = renderHook(() => useDebounce(func, 1000))
    const debouncedFunc = result.current

    debouncedFunc("first")
    vi.advanceTimersByTime(500) // 500ms elapsed

    debouncedFunc("second") // Timer should reset here
    vi.advanceTimersByTime(500) // 1000ms total, but only 500ms since last call

    expect(func).not.toHaveBeenCalled()

    vi.advanceTimersByTime(500) // 1500ms total, 1000ms since last call
    expect(func).toHaveBeenCalledTimes(1)
    expect(func).toHaveBeenCalledWith("second")
  })
})
