using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using RouteAnalytics.Domain.Entities;
using RouteAnalytics.Domain.Interfaces;
using RouteAnalytics.Infrastructure.Data;
using RouteAnalytics.Infrastructure.Extensions;

namespace RouteAnalytics.Infrastructure.Services
{
    public class SpatialRoutingService : ISpatialRoutingService
    {
        private readonly AppDbContext _dbContext;
        private readonly GeometryFactory _geometryFactory;

        public SpatialRoutingService(AppDbContext dbContext)
        {
            _dbContext = dbContext;
            _geometryFactory = new GeometryFactory();
        }

        public async Task<IEnumerable<TransportNode>> SearchNodesAsync(string query)
        {
            return await _dbContext.TransportNodes
                .Where(n => EF.Functions.ILike(n.Name, $"%{query}%") || EF.Functions.ILike(n.IataCode, $"%{query}%"))
                .ToListAsync();
        }

        public async Task<TransportNode?> GetNearestNodeAsync(double lat, double lng)
        {
            var point = _geometryFactory.CreatePoint(new Coordinate(lng, lat));
            return await _dbContext.TransportNodes
                .OrderBy(n => n.GeomPoint.Distance(point))
                .FirstOrDefaultAsync();
        }

        public async Task<List<TransportNetwork>> CalculateRouteAsync(int sourceId, int targetId)
        {

            var sqlQuery = @"
                SELECT tn.*
                FROM pgr_dijkstra(
                    'SELECT id, source, target, cost FROM transport_networks',
                    @sourceId,
                    @targetId,
                    directed := false
                ) AS route
                JOIN transport_networks tn ON route.edge = tn.id
                ORDER BY route.seq;
            ";

            return await _dbContext.TransportNetworks
                .FromSqlRaw(sqlQuery, new Npgsql.NpgsqlParameter("@sourceId", sourceId), new Npgsql.NpgsqlParameter("@targetId", targetId))
                .ToListAsync();
        }

        public async Task<SavedRoute> SaveRouteHistoryAsync(int sourceId, int targetId, string modeType, double totalCost, List<TransportNetwork> segments)
        {
            var sourceNode = await _dbContext.TransportNodes.FindAsync(sourceId);
            var targetNode = await _dbContext.TransportNodes.FindAsync(targetId);
            string routeName = $"{sourceNode?.Name ?? "Unknown"} - {targetNode?.Name ?? "Unknown"}";

            var allCoordinates = segments
                .SelectMany(segment => segment.Geom.Coordinates)
                .Distinct()
                .ToArray();

            var combinedRoute = _geometryFactory.CreateLineString(allCoordinates);

            var savedRoute = new SavedRoute
            {
                Id = Guid.NewGuid(),
                RouteName = routeName,
                ModeType = modeType,
                TotalCost = totalCost,
                Route = combinedRoute,
                DistanceInKm = combinedRoute.CalculateDistanceInKm(),
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.SavedRoutes.Add(savedRoute);
            await _dbContext.SaveChangesAsync();

            return savedRoute;
        }

        public async Task<IEnumerable<SavedRoute>> GetRouteHistoryAsync()
        {
            return await _dbContext.SavedRoutes.OrderByDescending(r => r.CreatedAt).ToListAsync();
        }
    }
}