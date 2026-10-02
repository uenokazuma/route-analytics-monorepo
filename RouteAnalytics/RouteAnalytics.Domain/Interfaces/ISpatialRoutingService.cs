using System.Collections;
using NetTopologySuite.Geometries;
using RouteAnalytics.Domain.Entities;

namespace RouteAnalytics.Domain.Interfaces
{
    public interface ISpatialRoutingService
    {
        // Node Operations
        Task<IEnumerable<TransportNode>> SearchNodesAsync(string query);
        Task<TransportNode?> GetNearestNodeAsync(double lat, double lng);

        // Route Operations
        Task<List<TransportNetwork>> CalculateRouteAsync(int sourceId, int targetId);

        //History Operations
        Task<SavedRoute> SaveRouteHistoryAsync(int sourceId, int targetId, string modeType, double cost, List<TransportNetwork> segments);
        Task<IEnumerable<SavedRoute>> GetRouteHistoryAsync();
    }
}