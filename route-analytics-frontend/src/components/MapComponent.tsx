import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com',
  shadowUrl: 'https://unpkg.com',
  iconSize:[25, 41],
  iconAnchor: [12, 41]
});

interface MapComponentProps {
  startPoint: [number, number] | null;
  endPoint: [number, number] | null;
  routeLines: any[];
  onMapClick: (lat: number, lon: number) => void;
}

function RecenterMap({ startPoint, endPoint }: { startPoint: [number, number] | null; endPoint: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (startPoint && !endPoint) {
      map.flyTo(startPoint, 14, { animate: true });

    } else if (startPoint && endPoint) {
        const bounds = L.latLngBounds([startPoint, endPoint]);
        map.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  }, [startPoint, endPoint, map]);

  return null;
}

export default function MapComponent({ startPoint, endPoint, routeLines, onMapClick }: MapComponentProps) {
  
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  // Memetakan koordinat biner PostGIS [[lon, lat], ...] menjadi standard format Leaflet [[lat, lon], ...]
  const polylinePositions = routeLines.flatMap((segment: any) =>
    segment.coordinates.map((coord: [number, number]) => [coord[1], coord[0]])
  );

  return (
    <MapContainer center={[-2.5, 118.0]} zoom={5} style={{ height: '100%', width: '100%' }}>
        <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />
      <MapClickHandler />

      <RecenterMap startPoint={startPoint} endPoint={endPoint} />
      
      {startPoint && <Marker position={startPoint} icon={markerIcon} />}
      {endPoint && <Marker position={endPoint} icon={markerIcon} />}
      
      {polylinePositions.length > 0 && (
        <Polyline positions={polylinePositions} color="#2563eb" weight={6} opacity={0.8} />
      )}
    </MapContainer>
  );
}
