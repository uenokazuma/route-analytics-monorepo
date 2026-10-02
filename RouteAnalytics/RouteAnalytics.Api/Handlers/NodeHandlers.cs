using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using RouteAnalytics.Domain.Common;
using RouteAnalytics.Domain.Interfaces;

namespace RouteAnalytics.Api.Handlers;

public static class NodeHandlers
{
    public static async Task<IResult> SearchNodes(string query, ISpatialRoutingService routingService)
    {
        try
        {
            var nodes = await routingService.SearchNodesAsync(query);
            if (nodes == null || !nodes.Any())
            {
                var errorResponse = ApiResponse<object>.CreateFailure("No nodes found matching the query.", default);
                return Results.NotFound(errorResponse);
            }

            return Results.Ok(ApiResponse<object>.CreateSuccess("Nodes retrieved successfully.", nodes));
        }
        catch (Exception ex)
        {
            var errorResponse = ApiResponse<object>.CreateFailure($"An error occurred while searching for nodes: {ex.Message}", default);
            return Results.Json(errorResponse, statusCode: 500);
        }
    }

    public static async Task<IResult> GetNearestNode(double lat, double lng, ISpatialRoutingService routingService)
    {
        try {
            var node = await routingService.GetNearestNodeAsync(lat, lng);
            if (node == null)
            {
                var errorResponse = ApiResponse<object>.CreateFailure("No node found at the specified location.", default);
                return Results.NotFound(errorResponse);
            }

            return Results.Ok(ApiResponse<object>.CreateSuccess("Node retrieved successfully.", node));
        }
        catch (Exception ex)
        {
            var errorResponse = ApiResponse<object>.CreateFailure($"An error occurred while retrieving the node: {ex.Message}", default);
            return Results.Json(errorResponse, statusCode: 500);
        }
    }
}