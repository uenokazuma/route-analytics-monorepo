import { apiClient } from "./apiClient";
import { ApiResponse } from "../types/routing";

// Define the SpatialNode interface to represent a node with its properties
export interface SpatialNode {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export type TransportationMode = 'road' | 'sea' | 'air';

export const nodeService = {
  // GET: /api/nodes/search?query=[address]&mode=[road|sea|air]
  async searchNodes(query: string, mode: TransportationMode): Promise<ApiResponse<SpatialNode[]>> {
    const params = new URLSearchParams({ query, mode });
    return apiClient.get<ApiResponse<SpatialNode[]>>(`/api/nodes/search?${params.toString()}`);
  },

  // GET: /api/nodes/nearest?lat=...&long=...
  async getNearestNode(lat: number, long: number): Promise<ApiResponse<SpatialNode>> {
    return apiClient.get<ApiResponse<SpatialNode>>(`/api/nodes/nearest?lat=${lat}&long=${long}`);
  }
};
