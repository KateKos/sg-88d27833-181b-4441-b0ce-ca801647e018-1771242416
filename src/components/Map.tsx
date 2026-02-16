"use client"

import { useEffect, useMemo } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import type { Map as LeafletMap, LatLngExpression } from "leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

export interface BaseMapEventItem {
  id: string
  title: string
  address: string
  start: string
  lat: number
  lng: number
}

export interface MapProps<T extends BaseMapEventItem = BaseMapEventItem> {
  events: T[]
  onMarkerClick?: (ev: T) => void
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (!points.length) return
    if (points.length === 1) {
      map.setView(points[0], 14)
      return
    }
    const bounds = L.latLngBounds(points)
    map.fitBounds(bounds, { padding: [24, 24] })
  }, [map, points])
  return null
}

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  iconSize: [25, 41],
  shadowSize: [41, 41]
})

export function Map<T extends BaseMapEventItem>({ events, onMarkerClick }: MapProps<T>) {
  const points = useMemo<[number, number][]>(() => events.map(e => [e.lat, e.lng]), [events])
  const center = (points[0] as LatLngExpression) ?? ([39.799, -89.644] as LatLngExpression)

  return (
    <MapContainer
      {...({
        center,
        zoom: 13,
        scrollWheelZoom: true,
        style: { height: "100%", width: "100%" },
        className: "focus:outline-none",
      } as unknown as React.ComponentProps<typeof MapContainer>)}
    >
      <TileLayer
        {...({
          attribution: '© OSM contributors',
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        } as unknown as React.ComponentProps<typeof TileLayer>)}
      />
      <FitBounds points={points} />
      {events.map(ev => (
        <Marker
          key={ev.id}
          {...({
            position: [ev.lat, ev.lng] as LatLngExpression,
            icon: defaultIcon,
            eventHandlers: {
              click: () => onMarkerClick?.(ev),
            },
          } as unknown as React.ComponentProps<typeof Marker>)}
        >
          <Popup>
            <div className="space-y-1">
              <div className="font-medium">{ev.title}</div>
              <div className="text-xs opacity-75">{ev.address}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}