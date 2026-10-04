import React, { useState } from 'react';
import { Car, Navigation, Plane, Save, Ship, Trash2 } from 'lucide-react';
import AddressSearch from './AddressSearch';
import { LineStringGeometry, RouteHistoryItem } from '@/types/routing';
import { TransportationMode } from '@/services/nodeService';

interface LocationState {
  id: number;
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
  onSaveRoute?: () => Promise<void>;
  canSaveRoute?: boolean;
  selectedMode: TransportationMode | null;
  onModeChange: (mode: TransportationMode) => void;
  historyItems?: RouteHistoryItem[];
  onHistorySelect?: (geomString: string) => void;
  onHistoryDelete?: (id: string) => void;
}

function formatTravelTime(totalMinutes: number): string {
  const roundedMinutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
}

export default function SidebarPanel({
  startLoc,
  endLoc,
  setStartLoc,
  setEndLoc,
  routeData,
  onCalculateRoute,
  onSaveRoute,
  canSaveRoute = true,
  selectedMode,
  onModeChange,
  historyItems = [],
  onHistorySelect,
  onHistoryDelete
}: SidebarPanelProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'history'>('search');

  return (
    <div className="w-96 bg-white border-r border-gray-200 shadow-xl z-20 flex flex-col p-6 overflow-y-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6 tracking-tight flex items-center gap-2">
        🗺️ RouteAnalytics <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">prototype</span>
      </h1>

      <div className="mb-5 flex border-b border-gray-200" role="tablist" aria-label="Route panel">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'search'}
          aria-controls="search-panel"
          onClick={() => setActiveTab('search')}
          className={`flex-1 border-b-2 px-3 py-2 text-sm font-medium transition ${activeTab === 'search' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          Search
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'history'}
          aria-controls="history-panel"
          onClick={() => setActiveTab('history')}
          className={`flex-1 border-b-2 px-3 py-2 text-sm font-medium transition ${activeTab === 'history' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          History
        </button>
      </div>

      {activeTab === 'search' && (
        <div id="search-panel" role="tabpanel" aria-label="Route search">
          <AddressSearch 
            label="Origin (Point A)" 
            onLocationSelect={(id, lat, lon, name) => setStartLoc({ id, lat, lon, name })} 
            selectedMode={selectedMode}
            onModeChange={onModeChange}
            showModeSelector
          />
          <AddressSearch 
            label="Destination (Point B)" 
            onLocationSelect={(id, lat, lon, name) => setEndLoc({ id, lat, lon, name })} 
            selectedMode={selectedMode}
            onModeChange={onModeChange}
          />

          <div className="mt-4 flex flex-col gap-3">
            <button
              onClick={onCalculateRoute}
              disabled={startLoc === null || endLoc === null || selectedMode === null}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md shadow transition disabled:opacity-50 text-sm"
            >
              <Navigation className="h-4 w-4" /> Calculate Route
            </button>

            {routeData.length > 0 && onSaveRoute && (
              <button
                onClick={onSaveRoute}
                disabled={!canSaveRoute}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-md shadow transition disabled:cursor-not-allowed disabled:opacity-50 text-sm"
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
      )}

      {activeTab === 'history' && (
        <div id="history-panel" role="tabpanel" aria-label="Route history" className="min-h-0 flex-1 overflow-y-auto">
          {historyItems.length > 0 ? (
            <ul className="space-y-2">
              {historyItems.map((item) => {
                const mode = item.modeType.toLowerCase();
                const ModeIcon = mode === 'air' ? Plane : mode === 'sea' ? Ship : Car;

                return (
                  <li key={item.id} className="flex items-center gap-2 rounded-md border border-gray-200 p-3">
                    <button
                      type="button"
                      onClick={() => onHistorySelect?.(item.geom)}
                      disabled={!onHistorySelect}
                      className="flex min-w-0 flex-1 items-start gap-3 text-left"
                    >
                      <ModeIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{item.routeName}</p>
                        <p className="mt-1 text-xs text-gray-600">Travel time: {formatTravelTime(item.totalCost)}</p>
                        <p className="text-xs text-gray-600">Distance: {item.distanceInKm} km</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => onHistoryDelete?.(item.id)}
                      disabled={!onHistoryDelete}
                      aria-label={`Delete ${item.routeName} from history`}
                      title="Delete route"
                      className="shrink-0 rounded p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-gray-500">No saved routes yet.</p>
          )}
        </div>
      )}
    </div>
  );
}