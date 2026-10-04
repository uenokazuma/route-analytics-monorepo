using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using RouteAnalytics.Domain.Entities;
using RouteAnalytics.Infrastructure.Data;
using RouteAnalytics.Infrastructure.Extensions;

namespace RouteAnalytics.Infrastructure.Repositories
{
	public class SpatialQueryRepository
	{
		private readonly AppDbContext _dbContext;
		private readonly GeometryFactory _geometryFactory;

		public SpatialQueryRepository(AppDbContext dbContext)
		{
			_dbContext = dbContext;
			_geometryFactory = new GeometryFactory();
		}

		public async Task<IEnumerable<TransportNodes>> SearchNodesAsync(string query, string? modeType = null)
		{
			return await _dbContext.TransportNodes
				.Where(n => (modeType == null || n.ModeType == modeType) && (EF.Functions.ILike(n.Name, $"%{query}%") || EF.Functions.ILike(n.IataCode, $"%{query}%")))
				.ToListAsync();
		}

		public async Task<TransportNodes?> GetNearestNodeAsync(double lat, double lng)
		{
			var point = _geometryFactory.CreatePoint(new Coordinate(lng, lat));
			return await _dbContext.TransportNodes
				.OrderBy(n => n.GeomPoint.Distance(point))
				.FirstOrDefaultAsync();
		}

		public async Task<TransportNodes?> GetNodeByIdAsync(int nodeId)
		{
			return await _dbContext.TransportNodes.FindAsync(nodeId);
		}

		public async Task<List<TransportNetwork>> CalculateRouteAsync(int sourceId, int targetId, string? modeType = null)
		{
			var sqlQuery = @"
				WITH ClosestNodes AS (
					SELECT tnode.id AS search_id, network_closest.official_node_id
					  FROM transport_nodes tnode
					 CROSS JOIN LATERAL (
						SELECT
							CASE
								WHEN ST_Distance(ST_StartPoint(tnet.geom), tnode.geom_point) < ST_Distance(ST_EndPoint(tnet.geom), tnode.geom_point) THEN
									tnet.source
								ELSE tnet.target
							END AS official_node_id
						  FROM transport_network tnet
						 WHERE tnet.source IS NOT NULL AND tnet.target IS NOT NULL
						   AND tnet.mode_type = tnode.mode_type
						   AND (@modeType::text IS NULL OR tnet.mode_type = @modeType)
						   AND  ST_DWithin(tnet.geom, tnode.geom_point, 0.005)
					  ORDER BY tnet.geom <-> tnode.geom_point
					     LIMIT 1) AS network_closest
					 WHERE tnode.id IN (@sourceId, @targetId)),
				RouteIds AS (
					SELECT
						(SELECT official_node_id FROM ClosestNodes WHERE search_id = @sourceId) AS source_node,
						(SELECT official_node_id FROM ClosestNodes WHERE search_id = @targetId) AS target_node
				)

                SELECT tn.id, tn.name, tn.mode_type, tn.country_code, tn.source, tn.target, tn.cost, tn.reverse_cost, ST_AsGeoJSON(tn.geom) AS geom
                FROM pgr_dijkstra(
                    'SELECT id, source, target, cost FROM transport_network',
                    (SELECT source_node FROM RouteIds),
                    (SELECT target_node FROM RouteIds),
                    directed := false
                ) AS route
                JOIN transport_network tn ON route.edge = tn.id
				WHERE tn.name IS NOT NULL AND tn.mode_type IS NOT NULL
                ORDER BY route.seq;
            ";

			return await _dbContext.TransportNetworks
				.FromSqlRaw(sqlQuery, new Npgsql.NpgsqlParameter("@sourceId", sourceId), new Npgsql.NpgsqlParameter("@targetId", targetId), new Npgsql.NpgsqlParameter("@modeType", (object?)modeType ?? DBNull.Value))
				.ToListAsync();
		}

		public async Task<string?> GetCombinedRouteWktAsync(List<TransportNetwork> segments)
		{
			const string sqlCombinedRoute = @"
				SELECT ST_AsText(ST_Union(geom))
				  FROM transport_network
				 WHERE id = ANY(@segmentIds)";

			var result = await _dbContext.Database
				.SqlQueryRaw<string>(sqlCombinedRoute, new Npgsql.NpgsqlParameter("@segmentIds", segments.Select(s => s.Id).ToArray()))
				.ToListAsync();
			
			return result.FirstOrDefault();
		}

		public async Task SaveRouteAsync(SavedRoute savedRoute)
		{
			_dbContext.SavedRoutes.Add(savedRoute);
			await _dbContext.SaveChangesAsync();
		}

		public async Task DeleteRouteAsync(Guid routeId)
		{
			var route = await _dbContext.SavedRoutes.FindAsync(routeId);
			if (route != null)
			{
				_dbContext.SavedRoutes.Remove(route);
				await _dbContext.SaveChangesAsync();
			}
		}

		public async Task<IEnumerable<SavedRoute>> GetRouteHistoryAsync()
		{
			return await _dbContext.SavedRoutes.OrderByDescending(r => r.CreatedAt)
				.ToListAsync();
		}
	}
}