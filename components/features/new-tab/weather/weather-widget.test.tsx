import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { WeatherWidget } from "./weather-widget"

const mockWeather = {
  current: {
    temp: 22,
    min_temp: 20,
    max_temp: 25,
    icon: "01d",
    description: "sunny",
    wind_speed: 5,
    wind_deg: 180,
    pop: 0,
  },
  hourly: [],
}

describe("WeatherWidget", () => {
  it("renders current temperature and description", () => {
    render(<WeatherWidget initialData={mockWeather} />)
    expect(screen.getByText("22°")).toBeDefined()
    expect(screen.getByText("sunny")).toBeDefined()
  })
})
