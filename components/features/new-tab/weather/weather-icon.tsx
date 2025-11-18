import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Cloudy,
  Moon,
  Sun,
} from "lucide-react"

export function WeatherIcon({
  iconCode,
  description,
  size = 28,
  className,
}: {
  iconCode: string
  description: string
  size?: number
  className?: string
}) {
  const props = { size, "aria-label": description, className }

  switch (iconCode) {
    case "01d": // clear sky day
      return <Sun {...props} />
    case "01n": // clear sky night
      return <Moon {...props} />
    case "02d": // few clouds day
      return <CloudSun {...props} />
    case "02n": // few clouds night
      return <CloudMoon {...props} />
    case "03d": // scattered clouds
    case "03n":
      return <Cloud {...props} />
    case "04d": // broken clouds
    case "04n":
      return <Cloudy {...props} />
    case "09d": // shower rain
    case "09n":
      return <CloudDrizzle {...props} />
    case "10d": // rain day
    case "10n": // rain night
      return <CloudRain {...props} />
    case "11d": // thunderstorm day
    case "11n": // thunderstorm night
      return <CloudLightning {...props} />
    case "13d": // snow day
    case "13n": // snow night
      return <CloudSnow {...props} />
    case "50d": // mist day
    case "50n": // mist night
      return <CloudFog {...props} />
    default:
      return <Cloud {...props} />
  }
}
