"use client"

import { ClientOnly } from "@/components/common/client-only"
import { CustomThemeEditor } from "@/components/common/custom-theme-editor"
import { ThemeSwitcher } from "@/components/common/theme-switcher"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type {
  DailyTaskWithCompletion,
  GeneralTodo,
  NewsArticle,
  QuickLink,
  UserSettings,
  WallpaperInfo,
  WeatherData,
} from "@/types/new-tab"
import { Edit } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, type ReactNode } from "react"
import { NewTabSettings } from "./new-tab-settings"
import { NewsWidget } from "./news/news-widget"
import { QuickLinksGrid } from "./quick-links/quick-links-grid"
import { QuickLinksSkeleton } from "./quick-links/quick-links-skeleton"
import { SearchBar } from "./search-bar"
import { TaskSkeleton } from "./todos/task-skeleton"
import { TasksWidget } from "./todos/tasks-widget"
import { BackgroundManager } from "./wallpaper/background-manager"
import { WallpaperControls } from "./wallpaper/wallpaper-controls"
import { WeatherWidget } from "./weather/weather-widget"

type NewTabContentProps = {
  initialLinks: QuickLink[]
  initialSettings: UserSettings
  initialWallpaper: WallpaperInfo
  initialWeather: WeatherData | null
  initialGeneralTodos: GeneralTodo[]
  initialDailyTasks: DailyTaskWithCompletion[]
  initialNews: NewsArticle[] | null
  authButton: ReactNode
}

export function NewTabContent({
  initialLinks,
  initialSettings,
  initialWallpaper,
  authButton,
  initialWeather,
  initialGeneralTodos,
  initialDailyTasks,
  initialNews,
}: NewTabContentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [wallpaperMode, setWallpaperMode] = useState(
    initialSettings.wallpaper_mode
  )
  const [wallpaperQuery, setWallpaperQuery] = useState(
    initialSettings.wallpaper_query
  )
  const { theme } = useTheme()

  const [isHovering, setIsHovering] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isCustomThemeEditorOpen, setIsCustomThemeEditorOpen] = useState(false)
  const [isNewsExpanded, setIsNewsExpanded] = useState(false)

  const isVisible =
    isHovering ||
    isMenuOpen ||
    isEditing ||
    isSettingsOpen ||
    isCustomThemeEditorOpen ||
    isNewsExpanded

  const skeletonCount = initialLinks.length > 0 ? initialLinks.length : 5

  return (
    <TooltipProvider delayDuration={300}>
      <BackgroundManager
        wallpaperMode={wallpaperMode}
        wallpaperUrl={initialWallpaper.url}
        gradientFrom={initialSettings.gradient_from ?? "220 70% 50%"}
        gradientTo={initialSettings.gradient_to ?? "280 65% 60%"}
        theme={theme}
      />

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-start gap-12 p-6">
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

        <div className="flex w-full max-w-7xl flex-1 items-start justify-center gap-8 pt-32 xl:justify-between">
          {/* This is the empty left slot. */}
          <div className="hidden w-64 xl:block"></div>
          <div className="flex w-full max-w-lg flex-col items-center gap-12">
            <ClientOnly fallback={<QuickLinksSkeleton count={skeletonCount} />}>
              <QuickLinksGrid
                initialLinks={initialLinks}
                isEditing={isEditing}
                userId={initialSettings.user_id}
              />
            </ClientOnly>

            <SearchBar
              initialEngine={initialSettings.default_search_engine ?? "google"}
            />
          </div>

          <div className="hidden w-64 xl:block">
            <ClientOnly fallback={<TaskSkeleton />}>
              <TasksWidget
                initialDailyTasks={initialDailyTasks}
                initialGeneralTodos={initialGeneralTodos}
              />
            </ClientOnly>
          </div>
        </div>
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
            wallpaperQuery={wallpaperQuery}
            onWallpaperQueryChangeAction={setWallpaperQuery}
            onWallpaperModeChangeAction={setWallpaperMode}
            onOpenChangeAction={setIsSettingsOpen}
          />

          <WallpaperControls
            initialWallpaper={initialWallpaper}
            wallpaperQuery={wallpaperQuery}
            wallpaperMode={wallpaperMode}
          />
        </div>

        <NewsWidget
          initialNews={initialNews}
          initialSettings={initialSettings}
          isExpanded={isNewsExpanded}
          setIsExpandedAction={setIsNewsExpanded}
        />
      </div>
    </TooltipProvider>
  )
}
