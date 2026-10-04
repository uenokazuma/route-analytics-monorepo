'use client';
import React, { startTransition, useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import SidebarPanel from '@/components/SidebarPanel';
import { routingService } from '@/services/routingService';
import { nodeService, TransportationMode } from '@/services/nodeService';
import { LineStringGeometry, RouteHistoryItem, TransportNetworkSegment } from '@/types/routing';

const MapComponent = dynamic(() => import('../components/MapComponent'), { ssr: false });

interface LocationState {
  id: number;
  lat: number;
  lon: number;
  name: string;
}

export default function DashboardPage() {
  const [startLoc, setStartLoc] = useState<LocationState | null>(null);
  const [endLoc, setEndLoc] = useState<LocationState | null>(null);
  const [routeData, setRouteData] = useState<LineStringGeometry[]>([]);
  const [routeSegments, setRouteSegments] = useState<TransportNetworkSegment[]>([]);
  const [selectedMode, setSelectedMode] = useState<TransportationMode | null>(null);
  const [calculatedRouteContext, setCalculatedRouteContext] = useState<{
    sourceId: number;
    targetId: number;
    mode: TransportationMode;
  } | null>(null);
  const [historyLogs, setHistoryLogs] = useState<RouteHistoryItem[]>([]);
  const [clickToggle, setClickToggle] = useState<'start' | 'end'>('start');

  const fetchHistoryLogs = useCallback(async () => {
    try {
      const response = await routingService.getRouteHistory();
      startTransition(() => {
        setHistoryLogs(response.success ? response.data : []);
      });
    } catch (error) {
      console.error('Error fetching route history:', error);
    }
  }, []);

  useEffect(() => {
    void fetchHistoryLogs();
  }, [fetchHistoryLogs]);

  const handleMapClick = async (lat: number, lon: number) => {
    try {
      const response = await nodeService.getNearestNode(lat, lon);
      
      if (response.success && response.data) {
        const officialNode = response.data;
        
        const mappedLocation: LocationState = {
          id: officialNode.id,
          lat: officialNode.latitude,
          lon: officialNode.longitude,
          name: officialNode.name
        };

        if (clickToggle === 'start') {
          setStartLoc(mappedLocation);
          setClickToggle('end');
        } else {
          setEndLoc(mappedLocation);
          setClickToggle('start');
        }
      }
    } catch (error: any) {
      console.error('Gagal memetakan koordinat klik ke jalan terdekat:', error);
    }
  };

  const handleCalculateRoute = async () => {
    if (!startLoc || !endLoc || !selectedMode) return;

    setRouteSegments([]);
    setCalculatedRouteContext(null);

    try {
      // send the IDs of the start and end locations to the routing service
      const result = await routingService.calculateRoute(startLoc.id, endLoc.id, selectedMode);
      
      if (result.success) {
		const routeLines: LineStringGeometry[] = result.data.map((segment) => JSON.parse(segment.geom));
		
        setRouteData(routeLines);
        setRouteSegments(result.data);
        setCalculatedRouteContext({
          sourceId: startLoc.id,
          targetId: endLoc.id,
          mode: selectedMode,
        });
      } else {
        setRouteSegments([]);
        alert(result.message);
      }
    } catch (error: any) {
      setRouteSegments([]);
      alert(error.message);
    }
  };

  const handleSaveRoute = async () => {
    if (!startLoc || !endLoc || !selectedMode || routeSegments.length === 0) return;
    if (
      !calculatedRouteContext ||
      calculatedRouteContext.sourceId !== startLoc.id ||
      calculatedRouteContext.targetId !== endLoc.id ||
      calculatedRouteContext.mode !== selectedMode
    ) {
      alert('Recalculate the route before saving.');
      return;
    }

    try {
      const payload = {
        sourceId: startLoc.id,
        targetId: endLoc.id,
        modeType: selectedMode,
        totalCost: routeSegments.reduce((total, segment) => total + segment.cost, 0),
        segments: routeSegments,
      };
      const response = await routingService.saveRoute(payload);

      if (response.success) {
        await fetchHistoryLogs();
      } else {
        alert(response.message);
      }
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Failed to save route.');
    }
  };

  const handleHistorySelect = (geomString: string) => {
    try {
      const parsedGeom = JSON.parse(geomString);
      setRouteData([parsedGeom]);
      setRouteSegments([]);
      setCalculatedRouteContext(null);
    } catch (e) {
      console.error('Failed to parse historical path:', e);
    }
  };

  const handleHistoryDelete = async (routeId: string) => {
    if (!window.confirm('Delete this route from history?')) return;

    try {
      const response = await routingService.deleteRouteHistory(routeId);
      if (response.success) {
        await fetchHistoryLogs();
      } else {
        alert(response.message ?? 'Failed to delete route.');
      }
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Failed to delete route.');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Sidebar - receive new location state with ID */}
      <SidebarPanel
        startLoc={startLoc}
        endLoc={endLoc}
        setStartLoc={setStartLoc}
        setEndLoc={setEndLoc}
        routeData={routeData}
        onCalculateRoute={handleCalculateRoute}
        onSaveRoute={handleSaveRoute}
        canSaveRoute={Boolean(
          calculatedRouteContext &&
          calculatedRouteContext.sourceId === startLoc?.id &&
          calculatedRouteContext.targetId === endLoc?.id &&
          calculatedRouteContext.mode === selectedMode
        )}
        selectedMode={selectedMode}
        onModeChange={setSelectedMode}
        historyItems={historyLogs}
        onHistorySelect={handleHistorySelect}
        onHistoryDelete={handleHistoryDelete}
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
