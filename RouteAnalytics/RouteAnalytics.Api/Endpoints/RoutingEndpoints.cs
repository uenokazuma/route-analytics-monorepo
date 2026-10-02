using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using RouteAnalytics.Domain.Interfaces;
using RouteAnalytics.Api.Handlers;

namespace RouteAnalytics.Api.Endpoints;

public static class RoutingEndpoints
{
    public static void MapRoutingEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api");

        group.MapGet("/nodes/search", NodeHandlers.SearchNodes);
        group.MapGet("/nodes/nearest", NodeHandlers.GetNearestNode);

        group.MapGet("/routes/calculate", RoutingHandlers.CalculateRoute);
        group.MapPost("/routes/save", RoutingHandlers.SaveRoute);
        group.MapGet("/routes/history", RoutingHandlers.GetRouteHistory);
    }
}