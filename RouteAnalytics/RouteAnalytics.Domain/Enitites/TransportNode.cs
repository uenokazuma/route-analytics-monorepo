using NetTopologySuite.Geometries;

namespace RouteAnalytics.Domain.Entities;

public class TransportNode
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ModeType { get; set; } = string.Empty;
    public string? CountryCode { get; set; }
    public string? IataCode { get; set; }
    public Point GeomPoint { get; set; } = null!;

}