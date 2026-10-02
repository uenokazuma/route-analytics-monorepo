'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import SidebarPanel from '@/components/SidebarPanel'; // Panggil sidebar baru
import { routingService } from '@/services/routingService';
import { LineStringGeometry } from '@/types/routing';

const MapComponent = dynamic(() => import('../components/MapComponent'), { ssr: false });

interface LocationState {
  lat: number;
  lon: number;
  name: string;
}

export default function DashboardPage() {
  const [startLoc, setStartLoc] = useState<LocationState | null>(null);
  const [endLoc, setEndLoc] = useState<LocationState | null>(null);
  const [routeData, setRouteData] = useState<LineStringGeometry[]>([]);
  const [clickToggle, setClickToggle] = useState<'start' | 'end'>('start');

  const handleMapClick = (lat: number, lon: number) => {
    const formattedName = `Pin at (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
    if (clickToggle === 'start') {
      setStartLoc({ lat, lon, name: formattedName });
      setClickToggle('end');
    } else {
      setEndLoc({ lat, lon, name: formattedName });
      setClickToggle('start');
    }
  };

  const handleCalculateRoute = async () => {
    if (!startLoc || !endLoc) return;

    try {
      const result = await routingService.calculateRoute(startLoc.lon, startLoc.lat, endLoc.lon, endLoc.lat);
      if (result.success) {
        setRouteData(result.data);
      } else {
        alert(result.message);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Sidebar - Bersih dari baris elemen HTML input */}
      <SidebarPanel
        startLoc={startLoc}
        endLoc={endLoc}
        setStartLoc={setStartLoc}
        setEndLoc={setEndLoc}
        routeData={routeData}
        onCalculateRoute={handleCalculateRoute}
      />

      {/* Map View */}
      <div className="flex-1 h-full w-full z-10 relative">
        <MapComponent
          startPoint={startLoc ? [startLoc.lat, startLoc.lon] : null}
          endPoint={endLoc ? [endLoc.lat, endLoc.lon] : null}
          routeLines={routeData}
          onMapClick={handleMapClick}
        />
      </div>
    </div>
  );
}
