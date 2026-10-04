using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using RouteAnalytics.Domain.DTOs;
using RouteAnalytics.Domain.Entities;
using RouteAnalytics.Domain.Interfaces;
using RouteAnalytics.Infrastructure.Extensions;
using RouteAnalytics.Infrastructure.Repositories;

namespace RouteAnalytics.Infrastructure.Services
{
    public class SpatialRoutingService : ISpatialRoutingService
    {
		private readonly SpatialQueryRepository _spatialQueryRepository;
        public SpatialRoutingService(SpatialQueryRepository spatialQueryRepository)
        {
            _spatialQueryRepository = spatialQueryRepository;
        }

        public async Task<IEnumerable<TransportNodeDto>> SearchNodesAsync(string query, string? modeType = null)
        {
			var nodes = await _spatialQueryRepository.SearchNodesAsync(query, modeType);

            var nodeDtos = nodes.Select(n => new TransportNodeDto(
				n.Id,
				n.Name,
				n.ModeType,
				n.CountryCode,
				n.IataCode,
				n.GeomPoint.Y,
				n.GeomPoint.X
			)).ToList();

			return nodeDtos;
        }

        public async Task<TransportNodes?> GetNearestNodeAsync(double lat, double lng)
        {
            return await _spatialQueryRepository.GetNearestNodeAsync(lat, lng);
        }

        public async Task<List<TransportNetwork>> CalculateRouteAsync(int sourceId, int targetId, string? modeType = null)
        {
            var routeSegments = await _spatialQueryRepository.CalculateRouteAsync(sourceId, targetId, modeType);
			
			return routeSegments ?? new List<TransportNetwork>();
        }

        public async Task<SavedRouteDto> SaveRouteAsync(int sourceId, int targetId, string modeType, double totalCost, List<TransportNetwork> segments)
        {
            var sourceNode = await _spatialQueryRepository.GetNodeByIdAsync(sourceId);
            var targetNode = await _spatialQueryRepository.GetNodeByIdAsync(targetId);
            string routeName = $"{sourceNode?.Name ?? "Unknown"} - {targetNode?.Name ?? "Unknown"}";
			
			var routeSegments = await _spatialQueryRepository.CalculateRouteAsync(sourceId, targetId, modeType);
			
			string wktText = await _spatialQueryRepository.GetCombinedRouteWktAsync(segments);

			if (string.IsNullOrEmpty(wktText))
			{
				throw new Exception("Failed to generate WKT for the combined route.");
			}

			var combinedRoute = new WKTReader().Read(wktText);

			var savedRoute = new SavedRoute
			{
				Id = Guid.NewGuid(),
				RouteName = routeName,
				ModeType = modeType,
				TotalCost = Math.Round(totalCost, 2),
				Route = combinedRoute,
				DistanceInKm = Math.Round(combinedRoute.CalculateDistanceInKm(), 2),
				CreatedAt = DateTime.UtcNow
			};

			await _spatialQueryRepository.SaveRouteAsync(savedRoute);

			var savedRouteDto = new SavedRouteDto(
				savedRoute.Id,
				savedRoute.RouteName,
				savedRoute.ModeType,
				savedRoute.TotalCost,
				savedRoute.DistanceInKm,
				savedRoute.CreatedAt,
				wktText
			);

			return savedRouteDto;
		}

		public async Task DeleteRouteAsync(Guid routeId)
		{
			await _spatialQueryRepository.DeleteRouteAsync(routeId);
		}

        public async Task<IEnumerable<SavedRouteDto>> GetRouteHistoryAsync()
        {
            var historyRoute = await _spatialQueryRepository.GetRouteHistoryAsync();

			var historyRouteDto = historyRoute.Select(r => new SavedRouteDto(
				r.Id,
				r.RouteName,
				r.ModeType,   
				r.TotalCost,
				r.DistanceInKm,
				r.CreatedAt,
				r.Route != null ? new WKTWriter().Write(r.Route) : null
			)).ToList();
			
			return historyRouteDto;
        }
    }
}