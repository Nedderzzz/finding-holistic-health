'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface MapProps {
  latitude?: number | null;
  longitude?: number | null;
  city?: string;
  state?: string;
}

// Fix default icon issues in some bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapView({ latitude, longitude, city, state }: MapProps) {
  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number';
  const center: [number, number] = hasCoords ? [latitude as number, longitude as number] : [39.8283, -98.5795]; // center US fallback

  return (
    <MapContainer center={center} zoom={hasCoords ? 13 : 4} scrollWheelZoom={false} className="w-full h-full">
      <TileLayer url={process.env.NEXT_PUBLIC_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'} attribution={process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || '&copy; OpenStreetMap contributors'} />
      {hasCoords ? (
        <Marker position={[latitude as number, longitude as number]}>
          <Popup>
            {city}, {state}
          </Popup>
        </Marker>
      ) : null}
    </MapContainer>
  );
}
