"use client"

import { updateNewTabSettings } from "@/app/new-tab/actions/settings"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import {
  applyCustomTheme,
  applySavedTheme,
  colorKeys,
  type ColorTheme,
  generateHarmoniousTheme,
  getSavedTheme,
  hexToHslString,
  hslStringToHex,
} from "@/lib/theme-utils"
import { Paintbrush, Shuffle } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function CustomThemeEditor({
  initialGradientFrom,
  initialGradientTo,
  onOpenChangeAction,
}: {
  initialGradientFrom: string | null
  initialGradientTo: string | null
  onOpenChangeAction: (open: boolean) => void
}) {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const [popoverOpen, setPopoverOpen] = useState(false)

  const [customColors, setCustomColors] = useState<ColorTheme>({})
  const [defaultStyles, setDefaultStyles] = useState<ColorTheme>({})
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    const { colors: savedColors, isDark: savedIsDark } = getSavedTheme()
    const computed = getComputedStyle(document.documentElement)
    const defaults: ColorTheme = {}
    for (const key of colorKeys) {
      defaults[key] = computed.getPropertyValue(key).trim()
    }
    setDefaultStyles(defaults)
    setCustomColors({
      ...savedColors,
      "--gradient-from":
        savedColors["--gradient-from"] ??
        initialGradientFrom ??
        defaults["--gradient-from"],
      "--gradient-to":
        savedColors["--gradient-to"] ??
        initialGradientTo ??
        defaults["--gradient-to"],
    })
    setIsDark(savedIsDark)
  }, [initialGradientFrom, initialGradientTo])

  const handleColorChange = (
    key: (typeof colorKeys)[number],
    value: string
  ) => {
    const newColors = { ...customColors, [key]: value }
    setCustomColors(newColors)
    applyCustomTheme({ [key]: value })
  }

  const handleRandomize = () => {
    const newTheme = generateHarmoniousTheme(isDark)
    setCustomColors(newTheme)
    applyCustomTheme(newTheme)
    document.documentElement.classList.toggle("dark", isDark)
  }

  const handleIsDarkChange = (checked: boolean) => {
    setIsDark(checked)
    const newTheme = generateHarmoniousTheme(checked)
    setCustomColors(newTheme)
    applyCustomTheme(newTheme)
    document.documentElement.classList.toggle("dark", checked)
  }

  const onPopoverOpenChange = (open: boolean) => {
    if (!open) {
      localStorage.setItem(
        "custom-theme",
        JSON.stringify({
          colors: customColors,
          isDark: isDark,
        })
      )
      if (theme === "custom") {
        applySavedTheme()
      }
      updateNewTabSettings({
        gradient_from: customColors["--gradient-from"],
        gradient_to: customColors["--gradient-to"],
      })
    }
    setPopoverOpen(open)
    onOpenChangeAction(open)
  }

  if (!mounted || theme !== "custom") {
    return null
  }

  return (
    <Popover open={popoverOpen} onOpenChange={onPopoverOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <Paintbrush size={16} className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px]" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Customize Theme</h4>
            <p className="text-sm text-muted-foreground">
              Click a color to change it.
            </p>
          </div>
          <div className="grid h-64 grid-cols-2 gap-x-6 gap-y-3 overflow-y-auto rounded-md border p-3">
            {colorKeys.map((key) => {
              const currentValue = customColors[key]
              const defaultValue = defaultStyles[key] ?? "0 0% 0%"
              const displayValue = currentValue ?? defaultValue

              return (
                <div key={key} className="flex items-center gap-2">
                  <div className="relative h-5 w-5">
                    <input
                      type="color"
                      id={`${key}-picker`}
                      value={hslStringToHex(displayValue)}
                      onChange={(e) =>
                        handleColorChange(key, hexToHslString(e.target.value))
                      }
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                    <Label
                      htmlFor={`${key}-picker`}
                      className="block h-full w-full cursor-pointer rounded-full border"
                      style={{
                        backgroundColor: `hsl(${displayValue})`,
                      }}
                    />
                  </div>
                  <Label
                    htmlFor={`${key}-picker`}
                    className="flex-1 truncate text-xs capitalize"
                  >
                    {key.replace("--", "")}
                  </Label>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleRandomize}
              className="flex-1"
            >
              <Shuffle className="mr-2 h-4 w-4" />
              Harmonize
            </Button>
            <div className="flex items-center space-x-2">
              <Switch
                id="dark-mode-toggle"
                checked={isDark}
                onCheckedChange={handleIsDarkChange}
              />
              <Label htmlFor="dark-mode-toggle" className="text-xs">
                Dark
              </Label>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
