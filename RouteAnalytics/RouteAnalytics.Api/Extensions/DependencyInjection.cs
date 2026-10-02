using Microsoft.EntityFrameworkCore;
using RouteAnalytics.Domain.Interfaces;
using RouteAnalytics.Infrastructure.Data;
using RouteAnalytics.Infrastructure.Services;

namespace RouteAnalytics.Api.Extensions;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, string connectionString)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.UseNetTopologySuite();
            })
        );

        services.AddScoped<ISpatialRoutingService, SpatialRoutingService>();

        services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", builder =>
            {
                builder.WithOrigins("http://localhost:3000") // Replace with your frontend URL
                       .AllowAnyMethod()
                       .AllowAnyHeader();
            });
        });

        return services;
    }
}