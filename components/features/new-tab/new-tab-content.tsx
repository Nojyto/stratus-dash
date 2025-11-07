"use client"

import {
  type QuickLink,
  type UserSettings,
  type WallpaperInfo,
  type WeatherData,
} from "@/app/new-tab/actions"
import { ClientOnly } from "@/components/common/client-only"
import { CustomThemeEditor } from "@/components/common/custom-theme-editor"
import { ThemeSwitcher } from "@/components/common/theme-switcher"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Edit } from "lucide-react"
import { useState, type ReactNode } from "react"
import { NewTabSettings } from "./new-tab-settings"
import { QuickLinksGrid } from "./quick-links/quick-links-grid"
import { SearchBar } from "./search-bar"
import { BackgroundManager } from "./wallpaper/background-manager"
import { WallpaperControls } from "./wallpaper/wallpaper-controls"
import { WeatherWidget } from "./weather/weather-widget"

type NewTabContentProps = {
  initialLinks: QuickLink[]
  initialSettings: UserSettings
  initialWallpaper: WallpaperInfo
  initialWeather: WeatherData | null
  authButton: ReactNode
}

export function NewTabContent({
  initialLinks,
  initialSettings,
  initialWallpaper,
  authButton,
  initialWeather,
}: NewTabContentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [wallpaperMode, setWallpaperMode] = useState(
    initialSettings.wallpaper_mode
  )

  // UI visibility state
  const [isHovering, setIsHovering] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isCustomThemeEditorOpen, setIsCustomThemeEditorOpen] = useState(false)

  const isVisible =
    isHovering ||
    isMenuOpen ||
    isEditing ||
    isSettingsOpen ||
    isCustomThemeEditorOpen

  return (
    <TooltipProvider delayDuration={300}>
      <BackgroundManager
        wallpaperMode={wallpaperMode}
        wallpaperUrl={initialWallpaper.url}
        gradientFrom={initialSettings.gradient_from ?? "220 70% 50%"}
        gradientTo={initialSettings.gradient_to ?? "280 65% 60%"}
      />
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-start gap-12 p-6 pt-32">
        <div className="absolute left-6 top-6 text-white">
          <WeatherWidget initialData={initialWeather} />
        </div>

        <div
          className={cn(
            "absolute right-6 top-6 flex items-center gap-1 opacity-0 transition-opacity delay-300 duration-300",
            isVisible && "opacity-100 delay-0 duration-0"
          )}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <Button
            variant={isEditing ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <CustomThemeEditor
            onOpenChangeAction={setIsCustomThemeEditorOpen}
            initialGradientFrom={initialSettings.gradient_from}
            initialGradientTo={initialSettings.gradient_to}
          />
          <ThemeSwitcher onOpenChangeAction={setIsMenuOpen} />
          {authButton}
        </div>

        <ClientOnly>
          <QuickLinksGrid
            initialLinks={initialLinks}
            isEditing={isEditing}
            userId={initialSettings.user_id}
          />

          <SearchBar
            initialEngine={initialSettings.default_search_engine ?? "google"}
          />
        </ClientOnly>

        {/* Wallpaper Controls */}
        <div
          className={cn(
            "absolute bottom-6 left-6 flex items-center gap-1 opacity-0 transition-opacity delay-300 duration-300",
            isVisible && "opacity-100 delay-0 duration-0"
          )}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <NewTabSettings
            initialSettings={initialSettings}
            onWallpaperModeChangeAction={setWallpaperMode}
            onOpenChangeAction={setIsSettingsOpen}
          />

          <WallpaperControls
            initialWallpaper={initialWallpaper}
            initialWallpaperQuery={initialSettings.wallpaper_query}
            wallpaperMode={wallpaperMode}
          />
        </div>
      </div>
    </TooltipProvider>
  )
}
