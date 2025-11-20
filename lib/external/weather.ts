"use server"

import type { WeatherData } from "@/types/new-tab"
import { unstable_cache as cache } from "next/cache"
import { env } from "../env"

type OpenWeatherForecastItem = {
  dt: number
  main: {
    temp: number
  }
  weather: {
    icon: string
    description: string
  }[]
  pop: number
}

export const getWeatherForCoords = cache(
  async (lat: number, lon: number): Promise<WeatherData | null> => {
    const apiKey = env.OPENWEATHER_API_KEY
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`

    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(currentWeatherUrl),
        fetch(forecastUrl),
      ])

      if (!currentRes.ok) {
        const errorData = await currentRes.json()
        console.error(
          "Failed to fetch current weather data:",
          errorData.message
        )
        return null
      }
      if (!forecastRes.ok) {
        const errorData = await forecastRes.json()
        console.error("Failed to fetch forecast data:", errorData.message)
        return null
      }

      const currentData = await currentRes.json()
      const forecastData = await forecastRes.json()

      return {
        current: {
          temp: Math.round(currentData.main.temp),
          min_temp: Math.floor(currentData.main.temp_min),
          max_temp: Math.ceil(currentData.main.temp_max),
          icon: currentData.weather[0].icon,
          description: currentData.weather[0].description,
          wind_speed: Math.round(currentData.wind.speed),
          wind_deg: currentData.wind.deg,
          pop: Math.round(forecastData.list[0].pop * 100),
        },
        hourly: forecastData.list
          .slice(0, 5)
          .map((hour: OpenWeatherForecastItem) => ({
            time: new Date(hour.dt * 1000).getHours().toString(),
            temp: Math.round(hour.main.temp),
            icon: hour.weather[0].icon,
            description: hour.weather[0].description,
            pop: Math.round(hour.pop * 100),
          })),
      }
    } catch (e) {
      console.error(
        "Error fetching or parsing weather data:",
        e instanceof Error ? e.message : String(e)
      )
      return null
    }
  },
  ["weather-data"],
  { revalidate: 900 }
)
