"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { divIcon, type LatLngExpression } from "leaflet"
import { MapPin } from "lucide-react"
import { useEffect, useState } from "react"
import ReactDOMServer from "react-dom/server"
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet"

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (coords: LatLngExpression) => void
}) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng])
    },
  })
  return null
}

interface LocationPickerProps {
  lat: number
  lon: number
  onLatChange: (lat: number) => void
  onLonChange: (lon: number) => void
}

export function LocationPicker({
  lat,
  lon,
  onLatChange,
  onLonChange,
}: LocationPickerProps) {
  const [position, setPosition] = useState<LatLngExpression>([lat, lon])
  const [hasMounted, setHasMounted] = useState(false)
  const [markerIcon, setMarkerIcon] = useState<L.DivIcon | null>(null)

  useEffect(() => {
    setHasMounted(true)

    const destructiveColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--destructive")

    setMarkerIcon(
      divIcon({
        html: ReactDOMServer.renderToString(
          <MapPin
            size={32}
            className="text-destructive"
            fill={`hsl(${destructiveColor})`}
          />
        ),
        className: "bg-transparent border-0",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })
    )
  }, [])

  useEffect(() => {
    if (hasMounted) {
      setPosition([lat, lon])
    }
  }, [lat, lon, hasMounted])

  const handleMapClick = (coords: LatLngExpression) => {
    setPosition(coords)
    if (Array.isArray(coords)) {
      onLatChange(coords[0])
      onLonChange(coords[1])
    }
  }

  if (!hasMounted || !markerIcon) {
    return null
  }

  return (
    <div className="grid gap-4">
      <div className="h-[200px] w-full overflow-hidden rounded-md">
        <MapContainer
          center={position}
          zoom={10}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={markerIcon} />
          <MapClickHandler onMapClick={handleMapClick} />
        </MapContainer>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="grid gap-1">
          <Label htmlFor="lat" className="text-xs">
            Latitude
          </Label>
          <Input
            id="lat"
            type="number"
            value={lat}
            onChange={(e) => onLatChange(Number(e.target.value))}
            className="h-8 text-xs"
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="lon" className="text-xs">
            Longitude
          </Label>
          <Input
            id="lon"
            type="number"
            value={lon}
            onChange={(e) => onLonChange(Number(e.target.value))}
            className="h-8 text-xs"
          />
        </div>
      </div>
    </div>
  )
}
