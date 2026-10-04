import { apiClient } from "./apiClient";
import { ApiResponse, SaveRoutePayload, TransportNetworkSegment } from "../types/routing";
import type { RouteHistoryItem } from "@/types/routing";

export const routingService = {
    
    // GET: /api/routes/calculate?sourceId=...&targetId=...
    async calculateRoute(sourceId: number, targetId: number, modeType?: string): Promise<ApiResponse<TransportNetworkSegment[]>> {
      const params = new URLSearchParams({ sourceId: String(sourceId), targetId: String(targetId) });
      if (modeType) params.set('modeType', modeType);

      return apiClient.get<ApiResponse<TransportNetworkSegment[]>>(
        `/api/routes/calculate?${params.toString()}`
      );
    },

  // POST: /api/routes/save
  async saveRoute(payload: SaveRoutePayload): Promise<ApiResponse<null>> {
    return apiClient.post<ApiResponse<null>>("/api/routes/save", payload);
  },

  // GET: /api/routes/history
  async getRouteHistory(): Promise<ApiResponse<RouteHistoryItem[]>> {
    return apiClient.get<ApiResponse<RouteHistoryItem[]>>("/api/routes/history");
  },

  // DELETE: /api/routes/delete/{routeId}
  async deleteRouteHistory(routeId: string): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/api/routes/delete/${encodeURIComponent(routeId)}`);
  }
};
