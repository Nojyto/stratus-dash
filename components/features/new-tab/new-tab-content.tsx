"use client"

import { ClientOnly } from "@/components/common/client-only"
import { CustomThemeEditor } from "@/components/common/custom-theme-editor"
import { ThemeSwitcher } from "@/components/common/theme-switcher"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import { NewTabProvider, useNewTab } from "@/contexts/NewTabContext"
import { cn } from "@/lib/utils"
import type {
  DailyTaskWithCompletion,
  GeneralTodo,
  QuickLink,
  UserSettings,
  WallpaperInfo,
} from "@/types/new-tab"
import { Edit, Home } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { type ReactNode } from "react"
import { NewTabSettings } from "./new-tab-settings"
import { QuickLinksGrid } from "./quick-links/quick-links-grid"
import { QuickLinksSkeleton } from "./quick-links/quick-links-skeleton"
import { SearchBar } from "./search-bar"
import { TaskSkeleton } from "./todos/task-skeleton"
import { TasksWidget } from "./todos/tasks-widget"
import { BackgroundManager } from "./wallpaper/background-manager"
import { WallpaperControls } from "./wallpaper/wallpaper-controls"

type NewTabContentProps = {
  initialLinks: QuickLink[]
  initialSettings: UserSettings
  initialWallpaper: WallpaperInfo
  initialGeneralTodos: GeneralTodo[]
  initialDailyTasks: DailyTaskWithCompletion[]
  authButton: ReactNode
  weatherWidget: ReactNode
  stockWidgets: ReactNode
  newsWidget: ReactNode
  calendarWidget: ReactNode
  isDemo?: boolean
}

export function NewTabContent(props: NewTabContentProps) {
  return (
    <NewTabProvider
      initialLinks={props.initialLinks}
      initialSettings={props.initialSettings}
      initialWallpaper={props.initialWallpaper}
      initialGeneralTodos={props.initialGeneralTodos}
      initialDailyTasks={props.initialDailyTasks}
      isDemo={props.isDemo}
    >
      <NewTabLayout {...props} />
    </NewTabProvider>
  )
}

function NewTabLayout({
  authButton,
  weatherWidget,
  stockWidgets,
  newsWidget,
  calendarWidget,
  isDemo,
}: NewTabContentProps) {
  const {
    links,
    settings,
    wallpaper,
    generalTodos,
    dailyTasks,
    isEditing,
    isUIVisible,
    setIsEditing,
    setUIVisibility,
  } = useNewTab()

  const { theme } = useTheme()

  const skeletonCount = links.length > 0 ? links.length : 5

  return (
    <TooltipProvider delayDuration={300}>
      <BackgroundManager
        wallpaperMode={settings.wallpaper_mode}
        wallpaperUrl={wallpaper.url}
        gradientFrom={settings.gradient_from ?? "220 70% 50%"}
        gradientTo={settings.gradient_to ?? "280 65% 60%"}
        theme={theme}
      />

      {/* Demo Banner */}
      {isDemo && (
        <div className="font-sm fixed top-0 z-50 flex w-full justify-center bg-primary px-4 py-0.5 text-xs text-primary-foreground">
          Demo Mode — Data is mocked and changes will not be saved.
        </div>
      )}

      {/* === Top === */}
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center gap-8 p-4 sm:p-6">
        <div className="absolute left-4 right-4 top-4 flex flex-row flex-wrap gap-2 sm:left-6 sm:right-auto sm:top-6 sm:flex-nowrap">
          {weatherWidget}
          {stockWidgets}
        </div>

        <div
          className={cn(
            "absolute right-4 top-24 flex flex-col items-end gap-1 opacity-0 transition-opacity delay-300 duration-300 sm:right-6 sm:top-6 sm:flex-row",
            isUIVisible && "opacity-100 delay-0 duration-0"
          )}
          onMouseEnter={() => setUIVisibility(true, false, false, false)}
          onMouseLeave={() => setUIVisibility(false, false, false, false)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            asChild
          >
            <Link href="/">
              <Home className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            variant={isEditing ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="h-4 w-4" />
          </Button>

          <CustomThemeEditor
            onOpenChangeAction={(open) =>
              setUIVisibility(false, open, false, open)
            }
            initialGradientFrom={settings.gradient_from}
            initialGradientTo={settings.gradient_to}
          />
          <ThemeSwitcher
            onOpenChangeAction={(open) =>
              setUIVisibility(false, open, false, false)
            }
          />
          {authButton}
        </div>

        {/* === Main Content === */}
        <div className="flex w-full max-w-7xl flex-1 flex-col items-center gap-8 pt-40 sm:pt-32 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex w-full max-w-lg flex-col items-center gap-8 xl:order-2">
            <ClientOnly fallback={<QuickLinksSkeleton count={skeletonCount} />}>
              <QuickLinksGrid />
            </ClientOnly>

            <SearchBar
              initialEngine={settings.default_search_engine ?? "duckduckgo"}
            />
          </div>

          <div className="w-full max-w-lg xl:order-3 xl:w-64">
            <ClientOnly fallback={<TaskSkeleton />}>
              <TasksWidget
                initialDailyTasks={dailyTasks}
                initialGeneralTodos={generalTodos}
              />
            </ClientOnly>
          </div>

          <div className="w-full max-w-lg xl:order-1 xl:w-64">
            {calendarWidget}
          </div>
        </div>

        {/* Bottom center: News */}
        {newsWidget}

        {/* Bottom left: Wallpaper Controls */}
        <div
          className={cn(
            "absolute bottom-6 left-4 right-4 flex items-center justify-center gap-1 opacity-0 transition-opacity delay-300 duration-300 sm:left-6 sm:right-auto sm:justify-start",
            isUIVisible && "opacity-100 delay-0 duration-0"
          )}
          onMouseEnter={() => setUIVisibility(true, false, false, false)}
          onMouseLeave={() => setUIVisibility(false, false, false, false)}
        >
          <NewTabSettings
            onOpenChangeAction={(open) =>
              setUIVisibility(false, false, open, false)
            }
          />
          <WallpaperControls />
        </div>
      </div>
    </TooltipProvider>
  )
}
