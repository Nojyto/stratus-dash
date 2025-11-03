"use client"

import { updateNewTabSettings } from "@/app/new-tab/actions"
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
  colorKeys,
  ColorTheme,
  generateHarmoniousTheme,
  getSavedTheme,
  hexToHslString,
  hslStringToHex,
} from "@/lib/theme-utils"
import { Paintbrush, Shuffle } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeCustomizer({
  onOpenChangeAction,
  initialGradientFrom,
  initialGradientTo,
}: {
  onOpenChangeAction: (open: boolean) => void
  initialGradientFrom: string | null
  initialGradientTo: string | null
}) {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()
  const [customColors, setCustomColors] = useState<ColorTheme>({})
  const [defaultStyles, setDefaultStyles] = useState<ColorTheme>({})
  const [isDarkForHarmonize, setIsDarkForHarmonize] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedColors = getSavedTheme()
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

    setIsDarkForHarmonize(resolvedTheme === "dark")
  }, [resolvedTheme, initialGradientFrom, initialGradientTo])

  const handleColorChange = (
    key: (typeof colorKeys)[number],
    value: string
  ) => {
    const newColors = { ...customColors, [key]: value }
    setCustomColors(newColors)
    applyCustomTheme({ [key]: value })
  }

  const handleRandomize = () => {
    const newTheme = generateHarmoniousTheme(isDarkForHarmonize)
    setCustomColors(newTheme)
    applyCustomTheme(newTheme)
  }

  const onPopoverOpenChange = (open: boolean) => {
    if (!open) {
      localStorage.setItem("custom-theme", JSON.stringify(customColors))
      updateNewTabSettings({
        gradient_from: customColors["--gradient-from"],
        gradient_to: customColors["--gradient-to"],
      })
    }
    onOpenChangeAction(open)
  }

  if (!mounted) {
    return <Button variant="ghost" size="sm" className="h-8 w-8" />
  }

  return (
    <Popover onOpenChange={onPopoverOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <Paintbrush className="h-4 w-4 text-muted-foreground" />
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
                checked={isDarkForHarmonize}
                onCheckedChange={setIsDarkForHarmonize}
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
