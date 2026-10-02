using System;
using NetTopologySuite.Geometries;

namespace RouteAnalytics.Domain.Entities;

public class SavedRoute
{
    public Guid Id { get; set; }
    public string RouteName { get; set; } = string.Empty;
    public string ModeType { get; set; } = string.Empty;
    public double TotalCost { get; set; }
    public LineString Route { get; set; } = null!;
    public double DistanceInKm { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
}
