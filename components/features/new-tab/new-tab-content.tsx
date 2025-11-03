"use client"

import {
  createQuickLink,
  getRandomWallpaper,
  lockWallpaper,
  unlockWallpaper,
  updateLinkOrder,
  updateNewTabSettings,
  type QuickLink,
  type UserSettings,
  type WallpaperInfo,
} from "@/app/new-tab/actions"
import { ClientOnly } from "@/components/common/client-only"
import { ThemeCustomizer } from "@/components/common/theme-customizer"
import { ThemeSwitcher } from "@/components/common/theme-switcher"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import {
  applyCustomTheme,
  getSavedTheme,
  hexToHslString,
  hslStringToHex,
} from "@/lib/theme-utils"
import { cn } from "@/lib/utils"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { Edit, Lock, Plus, Settings, Shuffle, Unlock } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useRef, useState, useTransition } from "react"
import { QuickLinkItem } from "./quick-link-item"
import { SearchBar } from "./search-bar"

type NewTabContentProps = {
  initialLinks: QuickLink[]
  initialSettings: UserSettings | null
  initialWallpaper: WallpaperInfo
}

const FALLBACK_ARTIST = "Unknown"
const LOCAL_ARTIST = "Local Image"

export function NewTabContent({
  initialLinks,
  initialSettings,
  initialWallpaper,
}: NewTabContentProps) {
  const { theme } = useTheme()
  const [links, setLinks] = useState(initialLinks)
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")

  // Wallpaper state
  const [wallpaper, setWallpaper] = useState(initialWallpaper)
  const [isLocked, setIsLocked] = useState(initialWallpaper.isLocked)
  const [wallpaperMode, setWallpaperMode] = useState(
    initialSettings?.wallpaper_mode ?? "image"
  )
  const [wallpaperQuery, setWallpaperQuery] = useState(
    initialSettings?.wallpaper_query ?? "nature landscape wallpaper"
  )
  const [gradientFrom, setGradientFrom] = useState(
    initialSettings?.gradient_from ?? "220 70% 50%"
  )
  const [gradientTo, setGradientTo] = useState(
    initialSettings?.gradient_to ?? "280 65% 60%"
  )
  const [isWallpaperPending, startWallpaperTransition] = useTransition()

  // State to manage visibility of top-right controls
  const [isHovering, setIsHovering] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const isVisible = isHovering || isMenuOpen || isEditing || isSettingsOpen

  const didDragEnd = useRef(false)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Apply wallpaper to the page background
  useEffect(() => {
    document.documentElement.style.setProperty("--gradient-from", gradientFrom)
    document.documentElement.style.setProperty("--gradient-to", gradientTo)

    if (wallpaperMode === "image") {
      document.documentElement.style.setProperty(
        "--bg-image",
        `url(${wallpaper.url})`
      )
      document.body.classList.add("bg-image-active")
      document.body.classList.remove("bg-gradient-active")
    } else {
      document.documentElement.style.removeProperty("--bg-image")
      document.body.classList.remove("bg-image-active")
      document.body.classList.add("bg-gradient-active")
    }

    return () => {
      document.documentElement.style.removeProperty("--bg-image")
      document.body.classList.remove("bg-image-active")
      document.body.classList.remove("bg-gradient-active")
    }
  }, [wallpaper.url, wallpaperMode, gradientFrom, gradientTo])

  useEffect(() => {
    if (!didDragEnd.current) {
      return
    }
    didDragEnd.current = false
    const linksToUpdate = links.map((link, index) => ({
      id: link.id,
      sort_order: index,
    }))
    startTransition(async () => {
      await updateLinkOrder(linksToUpdate)
    })
  }, [links, startTransition])

  const handleAddLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    startTransition(async () => {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("url", url)

      const result = await createQuickLink(formData)
      if (result.success) {
        setLinks([
          ...links,
          {
            id: crypto.randomUUID(),
            title: title || null,
            url,
            user_id: initialSettings?.user_id ?? "",
            sort_order: links.length,
          },
        ])
        setTitle("")
        setUrl("")
        setPopoverOpen(false)
      } else {
        console.error(result.error)
      }
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      didDragEnd.current = true

      setLinks((currentLinks) => {
        const oldIndex = currentLinks.findIndex((l) => l.id === active.id)
        const newIndex = currentLinks.findIndex((l) => l.id === over.id)
        return arrayMove(currentLinks, oldIndex, newIndex)
      })
    }
  }

  const handleRandomizeWallpaper = () => {
    startWallpaperTransition(async () => {
      const newWallpaper = await getRandomWallpaper(wallpaperQuery)
      setWallpaper({ ...newWallpaper, isLocked: false })
      setIsLocked(false)
      setWallpaperMode("image")
      await unlockWallpaper()
      await updateNewTabSettings({
        wallpaper_mode: "image",
        wallpaper_query: wallpaperQuery,
      })
    })
  }

  const handleToggleLockWallpaper = () => {
    startWallpaperTransition(async () => {
      if (isLocked) {
        await unlockWallpaper()
        setIsLocked(false)
      } else {
        await lockWallpaper(wallpaper.url, wallpaper.artist, wallpaper.photoUrl)
        setIsLocked(true)
        setWallpaperMode("image")
      }
    })
  }

  const handleSettingsSave = () => {
    startWallpaperTransition(async () => {
      await updateNewTabSettings({
        wallpaper_mode: wallpaperMode,
        wallpaper_query: wallpaperQuery,
        gradient_from: gradientFrom,
        gradient_to: gradientTo,
      })
      const theme = getSavedTheme()
      theme["--gradient-from"] = gradientFrom
      theme["--gradient-to"] = gradientTo
      localStorage.setItem("custom-theme", JSON.stringify(theme))
      applyCustomTheme(theme)
    })
    setIsSettingsOpen(false)
  }

  const formatArtistName = (name: string) => {
    if (!name || name === FALLBACK_ARTIST || name === LOCAL_ARTIST) return null
    const parts = name.split(" ")
    if (parts.length > 1) {
      return `${parts[0][0]}. ${parts.slice(1).join(" ")}`
    }
    return name
  }
  const artistName = formatArtistName(wallpaper.artist)

  return (
    <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-start gap-12 p-6 pt-32">
      <div
        className={cn(
          "absolute right-6 top-6 flex items-center gap-1 opacity-0 transition-opacity",
          isVisible && "opacity-100"
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
        <ThemeSwitcher onOpenChangeAction={setIsMenuOpen} />
        {theme === "custom" && (
          <ThemeCustomizer
            onOpenChangeAction={setIsMenuOpen}
            initialGradientFrom={initialSettings?.gradient_from ?? null}
            initialGradientTo={initialSettings?.gradient_to ?? null}
          />
        )}
      </div>

      <ClientOnly>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={links.map((l) => l.id)}>
            <div className="flex max-w-lg flex-wrap items-start justify-center gap-x-4 gap-y-6">
              {links.map((link) => (
                <QuickLinkItem
                  key={link.id}
                  link={link}
                  isEditing={isEditing}
                  onDeleteAction={(id) =>
                    setLinks(links.filter((l) => l.id !== id))
                  }
                  onUpdateAction={(updatedLink) =>
                    setLinks(
                      links.map((l) =>
                        l.id === updatedLink.id ? updatedLink : l
                      )
                    )
                  }
                />
              ))}

              {isEditing && (
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <div className="flex w-20 flex-col items-center gap-1.5">
                      <Button
                        variant="outline"
                        className="h-12 w-12 rounded-full border-dashed"
                        aria-label="Add new quick link"
                      >
                        <Plus className="h-6 w-6 text-muted-foreground" />
                      </Button>
                      <span className="w-full text-center text-xs text-muted-foreground">
                        Add Link
                      </span>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <form onSubmit={handleAddLink} className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">
                          Add new link
                        </h4>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title (Optional)</Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g., Google"
                          className="h-9"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="url">URL (Required)</Label>
                        <Input
                          id="url"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="example.com"
                          className="h-9"
                          required
                        />
                      </div>
                      <Button type="submit" disabled={isPending}>
                        {isPending ? "Adding..." : "Add Link"}
                      </Button>
                    </form>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </ClientOnly>

      <SearchBar
        initialEngine={initialSettings?.default_search_engine ?? "google"}
      />

      {/* Wallpaper Controls */}
      <div
        className={cn(
          "absolute bottom-6 left-6 flex items-center gap-1 opacity-0 transition-opacity",
          isVisible && "opacity-100"
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
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
                  <div className="grid gap-3">
                    <Label className="text-xs">Gradient Colors</Label>
                    <div className="flex items-center gap-2">
                      <div className="relative h-5 w-5">
                        <input
                          type="color"
                          id="gradient-from-picker"
                          value={hslStringToHex(gradientFrom)}
                          onChange={(e) =>
                            setGradientFrom(hexToHslString(e.target.value))
                          }
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                        <Label
                          htmlFor="gradient-from-picker"
                          className="block h-full w-full cursor-pointer rounded-full border"
                          style={{
                            backgroundColor: `hsl(${gradientFrom})`,
                          }}
                        />
                      </div>
                      <Label htmlFor="gradient-from-picker" className="text-xs">
                        From
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative h-5 w-5">
                        <input
                          type="color"
                          id="gradient-to-picker"
                          value={hslStringToHex(gradientTo)}
                          onChange={(e) =>
                            setGradientTo(hexToHslString(e.target.value))
                          }
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                        <Label
                          htmlFor="gradient-to-picker"
                          className="block h-full w-full cursor-pointer rounded-full border"
                          style={{
                            backgroundColor: `hsl(${gradientTo})`,
                          }}
                        />
                      </div>
                      <Label htmlFor="gradient-to-picker" className="text-xs">
                        To
                      </Label>
                    </div>
                  </div>
                )}
              </div>
              <Button onClick={handleSettingsSave} disabled={isPending}>
                Save Settings
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {wallpaperMode === "image" && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleToggleLockWallpaper}
              disabled={isWallpaperPending}
            >
              {isLocked ? (
                <Lock className="h-4 w-4" />
              ) : (
                <Unlock className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleRandomizeWallpaper}
              disabled={isWallpaperPending}
            >
              <Shuffle className="h-4 w-4" />
            </Button>
            {artistName && (
              <a
                href={wallpaper.photoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 rounded-full bg-black/30 px-3 py-1 text-xs text-white backdrop-blur-sm transition-colors hover:bg-black/50"
              >
                Photo by {artistName}
              </a>
            )}
          </>
        )}
      </div>
    </div>
  )
}
