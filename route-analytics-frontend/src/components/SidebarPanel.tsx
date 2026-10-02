import React from 'react';
import { Navigation, Save } from 'lucide-react';
import AddressSearch from './AddressSearch';
import { LineStringGeometry } from '@/types/routing';

interface LocationState {
  lat: number;
  lon: number;
  name: string;
}

interface SidebarPanelProps {
  startLoc: LocationState | null;
  endLoc: LocationState | null;
  setStartLoc: (loc: LocationState | null) => void;
  setEndLoc: (loc: LocationState | null) => void;
  routeData: LineStringGeometry[];
  onCalculateRoute: () => Promise<void>;
  onSaveRoute?: () => Promise<void>; // Opsional untuk pengembangan simpan riwayat nanti
}

export default function SidebarPanel({
  startLoc,
  endLoc,
  setStartLoc,
  setEndLoc,
  routeData,
  onCalculateRoute,
  onSaveRoute
}: SidebarPanelProps) {
  return (
    <div className="w-96 bg-white border-r border-gray-200 shadow-xl z-20 flex flex-col p-6 overflow-y-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6 tracking-tight flex items-center gap-2">
        🗺️ RouteAnalytics <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">.NET 10</span>
      </h1>

      <AddressSearch 
        label="Origin (Point A)" 
        onLocationSelect={(lat, lon, name) => setStartLoc({ lat, lon, name })} 
      />
      <AddressSearch 
        label="Destination (Point B)" 
        onLocationSelect={(lat, lon, name) => setEndLoc({ lat, lon, name })} 
      />

      <div className="mt-4 flex flex-col gap-3">
        <button
          onClick={onCalculateRoute}
          disabled={startLoc === null || endLoc === null}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md shadow transition disabled:opacity-50 text-sm"
        >
          <Navigation className="h-4 w-4" /> Calculate Route
        </button>

        {routeData.length > 0 && onSaveRoute && (
          <button
            onClick={onSaveRoute}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-md shadow transition text-sm"
          >
            <Save className="h-4 w-4" /> Save Route to History
          </button>
        )}
      </div>

      <div className="mt-6 border-t border-gray-200 pt-4">
        <p className="text-xs text-gray-500">
          💡 *Tip: You can click directly on the map surface to drop start and end pins dynamically.*
        </p>
      </div>
    </div>
  );
}
