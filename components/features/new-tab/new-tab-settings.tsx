"use client"

import { updateNewTabSettings, type UserSettings } from "@/app/new-tab/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { applyCustomTheme, getSavedTheme } from "@/lib/theme-utils"
import { Settings } from "lucide-react"
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
  initialSettings: UserSettings
  onWallpaperModeChangeAction: (mode: "image" | "gradient") => void
  onOpenChangeAction: (open: boolean) => void
}

export function NewTabSettings({
  initialSettings,
  onWallpaperModeChangeAction,
  onOpenChangeAction,
}: NewTabSettingsProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

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

  useEffect(() => {
    onWallpaperModeChangeAction(wallpaperMode)
  }, [wallpaperMode, onWallpaperModeChangeAction])

  const handleSettingsSave = () => {
    startTransition(async () => {
      await updateNewTabSettings({
        wallpaper_mode: wallpaperMode,
        wallpaper_query: wallpaperQuery,
        gradient_from: gradientFrom,
        gradient_to: gradientTo,
        weather_lat: lat,
        weather_lon: lon,
      })

      const themeData = getSavedTheme()
      themeData.colors["--gradient-from"] = gradientFrom
      themeData.colors["--gradient-to"] = gradientTo
      localStorage.setItem("custom-theme", JSON.stringify(themeData))
      applyCustomTheme(themeData.colors)

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
    }
    setIsSettingsOpen(open)
    onOpenChangeAction(open)
  }

  return (
    <Popover open={isSettingsOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Display Settings</h4>
          </div>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="wallpaper-mode">Image Mode</Label>
              <Switch
                id="wallpaper-mode"
                checked={wallpaperMode === "image"}
                onCheckedChange={(checked) =>
                  setWallpaperMode(checked ? "image" : "gradient")
                }
              />
            </div>
            {wallpaperMode === "image" ? (
              <div className="grid gap-1">
                <Label htmlFor="wallpaper-query" className="text-xs">
                  Wallpaper Query
                </Label>
                <Input
                  id="wallpaper-query"
                  value={wallpaperQuery}
                  onChange={(e) => setWallpaperQuery(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            ) : (
              <div></div>
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
