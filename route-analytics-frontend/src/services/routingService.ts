import { ApiResponse, LineStringGeometry } from "../types/routing";

const BASE_URL = "https://api.openrouteservice.org/v2/directions/driving-car";

export const routingService = {
    async calculateRoute(startLon: number, startLat: number, endLon: number, endLat: number): Promise<ApiResponse<LineStringGeometry[]>> {
        const url = `${BASE_URL}?calculate?startLon=${startLon}&startLat=${startLat}&endLon=${endLon}&endLat=${endLat}`;

        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Error fetching route: ${response.statusText}`);
        }

        return response.json()
    },

    async saveRoute(payload: {
        routeName: string;
        startLon: number;
        startLat: number;
        endLon: number;
        endLat: number;
        geometryData: LineStringGeometry[];
    }): Promise<ApiResponse<null>> {
        
        const res = await fetch(`${BASE_URL}/save-route`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error(`Error saving route: ${res.statusText}`);
        }

        return res.json();
    }
}