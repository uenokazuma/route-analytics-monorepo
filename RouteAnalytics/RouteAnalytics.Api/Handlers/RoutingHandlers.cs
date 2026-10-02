using RouteAnalytics.Domain.Interfaces;
using RouteAnalytics.Domain.Common;
using RouteAnalytics.Domain.Entities;

namespace RouteAnalytics.Api.Handlers;

public class RoutingHandlers
{
    public record CalculateRouteRequest(int SourceId, int TargetId);
    public record SaveRouteRequest(int SourceId, int TargetId, string ModeType, double TotalCost, List<TransportNetwork> segments);

    public static async Task<IResult> CalculateRoute(int sourceId, int targetId, ISpatialRoutingService routingService)
    {
        try
        {
            var route = await routingService.CalculateRouteAsync(sourceId, targetId);

            if(route == null || route.Count == 0)
            {
                var errorResponse = ApiResponse<object>.CreateFailure("No route found between the specified points.", default);
                return Results.NotFound(errorResponse);
            }

            var response = ApiResponse<object>.CreateSuccess("Route calculated successfully.", route);
            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            var errorResponse = ApiResponse<object>.CreateFailure($"An error occurred while calculating the route: {ex.Message}", default);
            return Results.Json(errorResponse, statusCode: 500);
        }
    }

    public static async Task<IResult> SaveRoute(SaveRouteRequest request, ISpatialRoutingService routingService)
    {
        try
        {
            var savedRoute = await routingService.SaveRouteHistoryAsync(request.SourceId, request.TargetId, request.ModeType, request.TotalCost, request.segments);

            if(savedRoute == null)
            {
                var errorResponse = ApiResponse<object>.CreateFailure("Failed to save the route history.", default);
                return Results.BadRequest(errorResponse);
            }

            var response = ApiResponse<object>.CreateSuccess("Route history saved successfully.", savedRoute);
            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            var errorResponse = ApiResponse<object>.CreateFailure($"An error occurred while saving the route history: {ex.Message}", default);
            return Results.Json(errorResponse, statusCode: 500);
        }
    }

    public static async Task<IResult> GetRouteHistory(ISpatialRoutingService routingService)
    {
        try
        {
            var routeHistory = await routingService.GetRouteHistoryAsync();

            if(routeHistory == null || !routeHistory.Any())
            {
                var errorResponse = ApiResponse<object>.CreateFailure("No route history found.", default);
                return Results.NotFound(errorResponse);
            }

            var response = ApiResponse<object>.CreateSuccess("Route history retrieved successfully.", routeHistory);
            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            var errorResponse = ApiResponse<object>.CreateFailure($"An error occurred while retrieving the route history: {ex.Message}", default);
            return Results.Json(errorResponse, statusCode: 500);
        }
    }
}