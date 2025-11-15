"use client"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { WeatherData } from "@/types/new-tab"
import { Droplet, MapPin, Navigation } from "lucide-react"
import { WeatherIcon } from "./weather-icon"

export function WeatherWidget({
  initialData,
}: {
  initialData: WeatherData | null
}) {
  if (!initialData) {
    return (
      <div className="flex h-10 items-center rounded-full bg-secondary/50 p-2 px-3 text-xs text-muted-foreground backdrop-blur-sm">
        <MapPin className="mr-2 h-4 w-4" />
        Set location in settings
      </div>
    )
  }

  const { current, hourly } = initialData

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="h-16 w-60 cursor-pointer items-center rounded-full bg-secondary/50 p-2 text-left text-foreground backdrop-blur-sm transition-colors hover:bg-secondary/75"
            >
              <div className="flex h-12 w-12 items-center justify-center">
                <WeatherIcon
                  iconCode={current.icon}
                  description={current.description}
                  size={28}
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold">{current.temp}°</span>
                  <span className="ml-0.5 overflow-ellipsis whitespace-nowrap text-lg text-muted-foreground first-letter:capitalize">
                    {current.description}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-2 pr-3 text-xs text-muted-foreground">
                  <div className="flex items-center" title="High/Low">
                    {current.max_temp}°/{current.min_temp}°
                  </div>
                  <div className="flex items-center" title="Chance of Rain">
                    <Droplet className="h-3 w-3" />
                    <span className="ml-0.5">{current.pop}%</span>
                  </div>
                  <div className="flex items-center" title="Wind Speed">
                    <Navigation
                      className="h-3 w-3"
                      style={{ transform: `rotate(${current.wind_deg}deg)` }}
                    />
                    <span className="ml-0.5">{current.wind_speed} m/s</span>
                  </div>
                </div>
              </div>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
      </Tooltip>
      <PopoverContent className="w-auto p-0">
        <div className="grid max-h-[50vh] grid-cols-1 overflow-y-auto bg-secondary/50 p-1 backdrop-blur-sm">
          {hourly.map((hour) => (
            <Tooltip key={hour.time}>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between gap-4 rounded-md p-2 px-4 hover:bg-accent">
                  <div className="flex w-10 items-baseline font-mono text-sm text-muted-foreground">
                    <span className="w-full text-right">{hour.time}</span>
                    <span>:00</span>
                  </div>
                  <WeatherIcon
                    iconCode={hour.icon}
                    description={hour.description}
                    size={24}
                  />
                  <span className="flex w-8 items-center justify-end gap-0.5 text-xs text-muted-foreground">
                    <Droplet className="h-3 w-3" />
                    {hour.pop}%
                  </span>
                  <span className="w-6 text-right text-base font-medium">
                    {hour.temp}°
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="capitalize">{hour.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
