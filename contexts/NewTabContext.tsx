"use client"

import type {
  DailyTaskWithCompletion,
  GeneralTodo,
  QuickLink,
  UserSettings,
  WallpaperInfo,
} from "@/types/new-tab"
import { useTheme } from "next-themes"
import * as React from "react"
import { useEffect, useState } from "react"

export type NewTabContextType = {
  // Initial Core Data
  links: QuickLink[]
  settings: UserSettings
  wallpaper: WallpaperInfo
  generalTodos: GeneralTodo[]
  dailyTasks: DailyTaskWithCompletion[]

  // UI State
  isEditing: boolean
  isUIVisible: boolean
  isDemo: boolean

  // State Updaters
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
  updateLinks: (newLinks: QuickLink[]) => void
  updateWallpaperInfo: (wallpaperInfo: WallpaperInfo) => void
  updateSettings: (newSettings: Partial<UserSettings>) => void
  setUIVisibility: (
    hovering: boolean,
    menuOpen: boolean,
    settingsOpen: boolean,
    customThemeOpen: boolean
  ) => void
}

const NewTabContext = React.createContext<NewTabContextType | undefined>(
  undefined
)

const useUIVisibility = () => {
  const [isHovering, setIsHovering] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isCustomThemeEditorOpen, setIsCustomThemeEditorOpen] = useState(false)

  const isVisible =
    isHovering || isMenuOpen || isSettingsOpen || isCustomThemeEditorOpen
  const { theme } = useTheme()

  useEffect(() => {
    if (!isMenuOpen && theme === "custom") {
      // Re-apply logic handled in CustomThemeEditor
    }
  }, [isMenuOpen, theme])

  const setUIVisibility = React.useCallback(
    (
      hovering: boolean,
      menuOpen: boolean,
      settingsOpen: boolean,
      customThemeOpen: boolean
    ) => {
      setIsHovering((prev) => (prev !== hovering ? hovering : prev))
      setIsMenuOpen((prev) => (prev !== menuOpen ? menuOpen : prev))
      setIsSettingsOpen((prev) => (prev !== settingsOpen ? settingsOpen : prev))
      setIsCustomThemeEditorOpen((prev) =>
        prev !== customThemeOpen ? customThemeOpen : prev
      )
    },
    []
  )

  return {
    isVisible,
    setUIVisibility,
  }
}

export function NewTabProvider({
  children,
  initialLinks,
  initialSettings,
  initialWallpaper,
  initialGeneralTodos,
  initialDailyTasks,
  isDemo = false,
}: {
  children: React.ReactNode
  initialLinks: QuickLink[]
  initialSettings: UserSettings
  initialWallpaper: WallpaperInfo
  initialGeneralTodos: GeneralTodo[]
  initialDailyTasks: DailyTaskWithCompletion[]
  isDemo?: boolean
}) {
  const [links, setLinks] = useState(initialLinks)
  const [settings, setSettings] = useState(initialSettings)
  const [wallpaper, setWallpaper] = useState(initialWallpaper)
  const [generalTodos] = useState(initialGeneralTodos)
  const [dailyTasks] = useState(initialDailyTasks)

  const [isEditing, setIsEditing] = useState(false)

  const { isVisible, setUIVisibility } = useUIVisibility()

  const updateLinks = React.useCallback((newLinks: QuickLink[]) => {
    setLinks(newLinks)
  }, [])

  const updateWallpaperInfo = React.useCallback(
    (newWallpaper: WallpaperInfo) => {
      setWallpaper(newWallpaper)
    },
    []
  )

  const updateSettings = React.useCallback(
    (newSettings: Partial<UserSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }))
    },
    []
  )

  useEffect(() => {
    setLinks(initialLinks)
  }, [initialLinks])
  useEffect(() => {
    setSettings(initialSettings)
  }, [initialSettings])
  useEffect(() => {
    setWallpaper(initialWallpaper)
  }, [initialWallpaper])

  const value = React.useMemo(
    () => ({
      links,
      settings,
      wallpaper,
      generalTodos,
      dailyTasks,
      isEditing,
      isUIVisible: isVisible,
      isDemo,
      setIsEditing,
      updateLinks,
      updateWallpaperInfo,
      updateSettings,
      setUIVisibility,
    }),
    [
      links,
      settings,
      wallpaper,
      generalTodos,
      dailyTasks,
      isEditing,
      isVisible,
      isDemo,
      updateLinks,
      updateWallpaperInfo,
      updateSettings,
      setUIVisibility,
    ]
  )

  return (
    <NewTabContext.Provider value={value}>{children}</NewTabContext.Provider>
  )
}

export function useNewTab() {
  const context = React.useContext(NewTabContext)
  if (context === undefined) {
    throw new Error("useNewTab must be used within a NewTabProvider")
  }
  return context
}
