"use client"

import { updateNewTabSettings } from "@/app/new-tab/actions/settings"
import { MultiSelectCombobox } from "@/components/common/multi-select-combobox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { useNewTab } from "@/contexts/NewTabContext"
import { STOCK_PRESETS } from "@/lib/external/stock-options"
import type { UserSettings } from "@/types/new-tab"
import { Loader2, RotateCcw, Settings } from "lucide-react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

const LocationPickerSkeleton = () => (
  <div className="grid gap-4">
    <div className="shimmer-bg h-[200px] w-full rounded-md" />
    <div className="grid grid-cols-2 gap-2">
      <div className="grid gap-1">
        <Label htmlFor="lat" className="text-xs">
          Latitude
        </Label>
        <div className="shimmer-bg h-8 w-full rounded-md" />
      </div>

      <div className="grid gap-1">
        <Label htmlFor="lon" className="text-xs">
          Longitude
        </Label>
        <div className="shimmer-bg h-8 w-full rounded-md" />
      </div>
    </div>
  </div>
)

const LocationPicker = dynamic(
  () => import("./weather/location-picker").then((mod) => mod.LocationPicker),
  {
    ssr: false,
    loading: () => <LocationPickerSkeleton />,
  }
)

type NewTabSettingsProps = {
  onOpenChangeAction: (open: boolean) => void
}

export function NewTabSettings({ onOpenChangeAction }: NewTabSettingsProps) {
  const { settings: initialSettings, updateSettings } = useNewTab()

  const DEFAULT_WALLPAPER_QUERY = "nature landscape wallpaper"
  const router = useRouter()

  const [isPending, startTransition] = useTransition()
  const [isDisconnecting, startDisconnectTransition] = useTransition()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const [wallpaperMode, setWallpaperMode] = useState(
    initialSettings.wallpaper_mode
  )
  const [wallpaperQuery, setWallpaperQuery] = useState(
    initialSettings.wallpaper_query
  )
  const [gradientFrom, setGradientFrom] = useState(
    initialSettings.gradient_from ?? "220 70% 50%"
  )
  const [gradientTo, setGradientTo] = useState(
    initialSettings.gradient_to ?? "280 65% 60%"
  )
  const [lat, setLat] = useState(initialSettings.weather_lat ?? 51.5072)
  const [lon, setLon] = useState(initialSettings.weather_lon ?? -0.1276)
  const [trackedStocks, setTrackedStocks] = useState(
    initialSettings.tracked_stocks
  )
  const [calendarUrl, setCalendarUrl] = useState("")

  useEffect(() => {
    setWallpaperMode(initialSettings.wallpaper_mode)
    setWallpaperQuery(initialSettings.wallpaper_query)
    setGradientFrom(initialSettings.gradient_from ?? "220 70% 50%")
    setGradientTo(initialSettings.gradient_to ?? "280 65% 60%")
    setLat(initialSettings.weather_lat ?? 51.5072)
    setLon(initialSettings.weather_lon ?? -0.1276)
    setTrackedStocks(initialSettings.tracked_stocks)
  }, [initialSettings])

  const handleSettingsSave = () => {
    startTransition(async () => {
      const settingsToUpdate: Parameters<typeof updateNewTabSettings>[0] = {
        wallpaper_mode: wallpaperMode,
        wallpaper_query: wallpaperQuery,
        gradient_from: gradientFrom,
        gradient_to: gradientTo,
        weather_lat: lat,
        weather_lon: lon,
        tracked_stocks: trackedStocks,
      }

      if (calendarUrl) {
        settingsToUpdate.calendar_ical_url = calendarUrl
      }

      await updateNewTabSettings(settingsToUpdate)

      updateSettings(settingsToUpdate as Partial<UserSettings>)

      router.refresh()
    })
    setIsSettingsOpen(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !isPending) {
      setWallpaperMode(initialSettings.wallpaper_mode)
      setWallpaperQuery(initialSettings.wallpaper_query)
      setGradientFrom(initialSettings.gradient_from ?? "220 70% 50%")
      setGradientTo(initialSettings.gradient_to ?? "280 65% 60%")
      setLat(initialSettings.weather_lat ?? 51.5072)
      setLon(initialSettings.weather_lon ?? -0.1276)
      setTrackedStocks(initialSettings.tracked_stocks)
      setCalendarUrl("")
    }
    setIsSettingsOpen(open)
    onOpenChangeAction(open)
  }

  const handleStockSelection = (updater: React.SetStateAction<string[]>) => {
    setTrackedStocks((current) => {
      const next = typeof updater === "function" ? updater(current) : updater
      if (next.length > 3) {
        return next.slice(0, 3)
      }
      return next
    })
  }

  const handleDisconnectCalendar = () => {
    startDisconnectTransition(async () => {
      await updateNewTabSettings({ calendar_ical_url: null })
      updateSettings({ calendar_ical_url: null })
      router.refresh()
    })
  }

  const handleResetQuery = () => {
    setWallpaperQuery(DEFAULT_WALLPAPER_QUERY)
  }

  return (
    <Popover open={isSettingsOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="m-2 w-80 sm:w-96">
        <div className="grid max-h-[75vh] gap-4 overflow-y-auto pr-2">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Display Settings</h4>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="wallpaper-mode">Image Mode</Label>

              <Switch
                id="wallpaper-mode"
                checked={wallpaperMode === "image"}
                onCheckedChange={(checked: boolean) =>
                  setWallpaperMode(checked ? "image" : "gradient")
                }
              />
            </div>

            {wallpaperMode === "image" ? (
              <div className="grid gap-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="wallpaper-query" className="text-xs">
                    Wallpaper Query
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                    onClick={handleResetQuery}
                    title="Restore default query"
                  >
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Default
                  </Button>
                </div>

                <Input
                  id="wallpaper-query"
                  value={wallpaperQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setWallpaperQuery(e.target.value)
                  }
                  placeholder={DEFAULT_WALLPAPER_QUERY}
                  className="h-8 text-xs"
                />
              </div>
            ) : (
              <div></div>
            )}
          </div>

          <div className="grid gap-2">
            <Label className="text-xs">Tracked Stocks (Max 3)</Label>
            <MultiSelectCombobox
              options={STOCK_PRESETS}
              selected={trackedStocks}
              onChangeAction={handleStockSelection}
              placeholder="Select stocks..."
              searchPlaceholder="Search stocks..."
              noResultsText="No stock found."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="calendar-url" className="text-xs">
              Calendar iCal URL
            </Label>
            <Input
              id="calendar-url"
              value={calendarUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCalendarUrl(e.target.value)
              }
              placeholder={
                initialSettings.calendar_ical_url
                  ? "Calendar Connected (Enter new to update)"
                  : "https://.../basic.ics"
              }
              className="h-8 text-xs"
            />
            {initialSettings.calendar_ical_url && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs text-destructive hover:text-destructive"
                onClick={handleDisconnectCalendar}
                disabled={isDisconnecting || isPending}
              >
                {isDisconnecting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Disconnect Calendar
              </Button>
            )}
          </div>

          <div className="grid gap-4">
            <Label className="text-xs">Weather Location</Label>

            <LocationPicker
              lat={lat}
              lon={lon}
              onLatChange={setLat}
              onLonChange={setLon}
            />
          </div>

          <Button onClick={handleSettingsSave} disabled={isPending}>
            Save Settings
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
