using NetTopologySuite.Geometries;

namespace RouteAnalytics.Domain.Entities;

public class TransportNetwork
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public string ModeType { get; set; } = string.Empty;
    public string CountryCode { get; set; } = string.Empty;
    public int? Source { get; set; }
    public int? Target { get; set; }
    public double Cost { get; set; }
    public double ReverseCost { get; set; }
    public LineString Geom { get; set; } = null!;
    
}