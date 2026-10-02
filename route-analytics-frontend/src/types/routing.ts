export interface LineStringGeometry {
  type: "LineString";
  coordinates: [number, number][];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

