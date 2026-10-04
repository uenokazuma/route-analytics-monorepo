using System;
using NetTopologySuite.Geometries;

namespace RouteAnalytics.Infrastructure.Extensions;

public static class GeometryExtensions
{
    public static double CalculateDistanceInKm(this Geometry geometry)
    {
		if (geometry == null) return 0.0;
		
		double totalDistance = 0.0;
		if (geometry is LineString lineString)
		{
			totalDistance = CalculateLineStringDistance(lineString);
		} else if (geometry is MultiLineString multiLineString)
		{
			foreach (var line in multiLineString.Geometries)
			{
				if (line is LineString lineStringPart)
				{
					totalDistance += CalculateLineStringDistance(lineStringPart);
				}
			}
		}

		return totalDistance;
	}

	private static double CalculateLineStringDistance(LineString lineString)
	{
        if (lineString == null || lineString.NumPoints < 2)
        {
            throw new ArgumentException("LineString must have at least two points.");
        }

        double distance = 0.0;

        for (int i = 0; i < lineString.NumPoints - 1; i++)
        {
            var point1 = lineString.GetPointN(i);
            var point2 = lineString.GetPointN(i + 1);

            distance += CalculateHaversineDistance(point1, point2);
        }

        return distance;
    }

    private static double CalculateHaversineDistance(Point point1, Point point2)
    {
        const double R = 6371; // Radius of the Earth in kilometers
        var lat1 = DegreesToRadians(point1.Y);
        var lon1 = DegreesToRadians(point1.X);
        var lat2 = DegreesToRadians(point2.Y);
        var lon2 = DegreesToRadians(point2.X);

        var dLat = (lat2 - lat1);
        var dLon = (lon2 - lon1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1) * Math.Cos(lat2) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return R * c; // Distance in kilometers
    }

    private static double DegreesToRadians(double degrees)
    {
        return degrees * (Math.PI / 180);
    }
}
