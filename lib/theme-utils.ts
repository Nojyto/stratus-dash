export function hslStringToHex(hslStr: string): string {
  const match = /([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/.exec(hslStr)
  if (!match) return "#000000"

  const h = Number(match[1])
  let s = Number(match[2])
  let l = Number(match[3])

  s /= 100
  l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const toHex = (c: number) =>
    Math.round(c * 255)
      .toString(16)
      .padStart(2, "0")
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
}

export function hexToHslString(hex: string): string {
  let r = 0,
    g = 0,
    b = 0
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16)
    g = parseInt(hex[2] + hex[2], 16)
    b = parseInt(hex[3] + hex[3], 16)
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16)
    g = parseInt(hex.substring(3, 5), 16)
    b = parseInt(hex.substring(5, 7), 16)
  }
  r /= 255
  g /= 255
  b /= 255
  const vmax = Math.max(r, g, b),
    vmin = Math.min(r, g, b)
  let h = 0,
    s = 0,
    l = (vmax + vmin) / 2
  if (vmax !== vmin) {
    const d = vmax - vmin
    s = l > 0.5 ? d / (2 - vmax - vmin) : d / (vmax + vmin)
    switch (vmax) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  h = Math.round(h * 360)
  s = Math.round(s * 100)
  l = Math.round(l * 100)
  return `${h} ${s}% ${l}%`
}

export const colorKeys = [
  "--background",
  "--foreground",
  "--card",
  "--popover",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--destructive-foreground",
  "--border",
  "--input",
  "--ring",
  "--gradient-from",
  "--gradient-to",
] as const

export type ColorTheme = Partial<Record<(typeof colorKeys)[number], string>>

export type CustomThemeData = {
  colors: ColorTheme
  isDark: boolean
}

export function applyCustomTheme(colors: ColorTheme) {
  const root = document.documentElement
  if (!root) return
  for (const [key, value] of Object.entries(colors)) {
    if (value) {
      root.style.setProperty(key, value)
    } else {
      root.style.removeProperty(key)
    }
  }
}

export function clearCustomTheme() {
  const root = document.documentElement
  if (!root) return
  const saved = localStorage.getItem("custom-theme")
  if (!saved) return
  try {
    const { colors } = getSavedTheme()
    for (const key of Object.keys(colors)) {
      root.style.removeProperty(key)
    }
    root.classList.remove("dark")
  } catch (e) {
    console.error("Failed to clear custom theme", e)
  }
}

export function getSavedTheme(): CustomThemeData {
  try {
    const saved = localStorage.getItem("custom-theme")
    if (!saved) return { colors: {}, isDark: false }

    const data = JSON.parse(saved)
    if (data.colors === undefined && data.isDark === undefined) {
      return { colors: data, isDark: false } // Assume old themes were light
    }

    return data as CustomThemeData
  } catch (e) {
    console.error("Failed to get saved theme", e)
    return { colors: {}, isDark: false }
  }
}

export function applySavedTheme() {
  const { colors, isDark } = getSavedTheme()
  if (Object.keys(colors).length > 0) {
    applyCustomTheme(colors)
    document.documentElement.classList.toggle("dark", isDark)
  }
}

export function generateHarmoniousTheme(isDark: boolean): ColorTheme {
  const baseHue = Math.floor(Math.random() * 360)
  const accentHue = (baseHue + 150) % 360
  const graySat = isDark ? 6 : 10

  const bgL = isDark ? 4 : 98
  const fgL = isDark ? 98 : 4
  const cardL = isDark ? 6 : 96
  const borderL = isDark ? 12 : 90
  const inputL = isDark ? 12 : 90
  const mutedL = isDark ? 15 : 94
  const mutedFgL = isDark ? 60 : 40
  const primarySat = 70
  const primaryL = 50
  const primaryFgL = isDark ? 90 : 10
  const accentSat = 60
  const accentL = isDark ? 45 : 55
  const accentFgL = isDark ? 98 : 4

  return {
    "--background": `${baseHue} ${graySat}% ${bgL}%`,
    "--foreground": `${baseHue} ${graySat}% ${fgL}%`,
    "--card": `${baseHue} ${graySat}% ${cardL}%`,
    "--popover": `${baseHue} ${graySat}% ${cardL}%`,
    "--border": `${baseHue} ${graySat}% ${borderL}%`,
    "--input": `${baseHue} ${graySat}% ${inputL}%`,
    "--secondary": `${baseHue} ${graySat}% ${mutedL}%`,
    "--secondary-foreground": `${baseHue} ${graySat}% ${fgL}%`,
    "--muted": `${baseHue} ${graySat}% ${mutedL}%`,
    "--muted-foreground": `${baseHue} ${graySat}% ${mutedFgL}%`,
    "--primary": `${accentHue} ${primarySat}% ${primaryL}%`,
    "--primary-foreground": `${baseHue} ${graySat}% ${primaryFgL}%`,
    "--accent": `${accentHue} ${accentSat}% ${accentL}%`,
    "--accent-foreground": `${baseHue} ${graySat}% ${accentFgL}%`,
    "--ring": `${accentHue} ${primarySat}% ${primaryL}%`,
    "--destructive": `0 84% 60%`,
    "--destructive-foreground": `0 0% 98%`,
    "--gradient-from": `${baseHue} ${graySat}% ${bgL}%`,
    "--gradient-to": `${accentHue} ${accentSat}% ${accentL}%`,
  }
}
