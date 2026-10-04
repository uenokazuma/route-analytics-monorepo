using System.Collections;
using NetTopologySuite.Geometries;
using RouteAnalytics.Domain.DTOs;
using RouteAnalytics.Domain.Entities;

namespace RouteAnalytics.Domain.Interfaces
{
    public interface ISpatialRoutingService
    {
        // Node Operations
        Task<IEnumerable<TransportNodeDto>> SearchNodesAsync(string query, string? modeType = null);
        Task<TransportNodes?> GetNearestNodeAsync(double lat, double lng);

        // Route Operations
        Task<List<TransportNetwork>> CalculateRouteAsync(int sourceId, int targetId, string? modeType = null);

        //History Operations
        Task<SavedRouteDto> SaveRouteAsync(int sourceId, int targetId, string modeType, double cost, List<TransportNetwork> segments);
		Task DeleteRouteAsync(Guid routeId);
        Task<IEnumerable<SavedRouteDto>> GetRouteHistoryAsync();
    }
}