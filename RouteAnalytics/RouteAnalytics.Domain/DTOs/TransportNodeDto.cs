namespace RouteAnalytics.Domain.DTOs;

public record TransportNodeDto(
	int Id,
	string Name,
	string ModeType,
	string? CountryCode,
	string? IataCode,
	double Latitude,
	double Longitude
);