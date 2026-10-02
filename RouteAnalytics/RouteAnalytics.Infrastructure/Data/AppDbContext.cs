using Microsoft.EntityFrameworkCore;
using RouteAnalytics.Domain.Entities;

namespace RouteAnalytics.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<TransportNode> TransportNodes => Set<TransportNode>();
    public DbSet<TransportNetwork> TransportNetworks => Set<TransportNetwork>();
    public DbSet<SavedRoute> SavedRoutes => Set<SavedRoute>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasPostgresExtension("postgis");

        modelBuilder.Entity<TransportNode>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.ModeType).IsRequired();
            entity.Property(e => e.CountryCode).IsRequired();
            entity.Property(e => e.IataCode).IsRequired();
            entity.Property(e => e.GeomPoint).HasColumnType("geometry(Point, 4326)").IsRequired();
        });

        modelBuilder.Entity<TransportNetwork>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.ModeType).IsRequired();
            entity.Property(e => e.CountryCode).IsRequired();
            entity.Property(e => e.Source).IsRequired();
            entity.Property(e => e.Target).IsRequired();
            entity.Property(e => e.Cost).IsRequired();
            entity.Property(e => e.ReverseCost).IsRequired();
            entity.Property(e => e.Geom).HasColumnType("geometry(LineString, 4326)").IsRequired();
        });

        modelBuilder.Entity<SavedRoute>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.RouteName).IsRequired();
            entity.Property(e => e.Route).IsRequired();
            entity.Property(e => e.DistanceInKm).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
        });
    }
}
