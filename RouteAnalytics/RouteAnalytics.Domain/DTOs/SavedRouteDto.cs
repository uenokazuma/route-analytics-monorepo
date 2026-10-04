namespace RouteAnalytics.Domain.DTOs;

public record SavedRouteDto(
	Guid Id,
	string RouteName,
	string ModeType,
	double TotalCost,
	double DistanceInKm,
	DateTime CreatedAt,
	string RouteGeoJson
);