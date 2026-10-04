export interface LineStringGeometry {
  type: "LineString";
  coordinates: [number, number][];
}

export interface RouteSegment {
  segmentId: string;
  geomatryData: LineStringGeometry;
}

export interface TransportNetworkSegment {
  id: number;
  name: string | null;
  modeType: string;
  countryCode: string;
  source: number | null;
  target: number | null;
  cost: number;
  reverseCost: number;
  geom: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface SaveRoutePayload {
  sourceId: number;
  targetId: number;
  modeType: string;
  totalCost: number;
  segments: TransportNetworkSegment[];
}

export interface RouteHistoryItem {
  id: string;
  routeName: string;
  modeType: string;
  totalCost: number;
  distanceInKm: number;
  geom: string; // Contains the raw GeoJSON text string from .NET 10
  createdAt: string;
}