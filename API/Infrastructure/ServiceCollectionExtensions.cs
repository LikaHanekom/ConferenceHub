using API.Repositories;
using API.Services;

namespace API.Infrastructure;

// ══════════════════════════════════════════════════════════════════════════════
// Phase 5: Implement IServiceCollection extension methods
//
// Extension methods group DI registrations by feature so Program.cs stays flat.
// Each method should:
//   1. Register the service interface mapped to its implementation (AddScoped)
//   2. Register the repository interface mapped to its implementation (AddScoped)
//   3. Return IServiceCollection to allow method chaining
//
// Once complete, Program.cs should call:
//   builder.Services
//       .AddBookingFeature()
//       .AddRoomFeature();
//
// Why Scoped and not Singleton or Transient?
//   Both services and repositories depend on BookingDbContext which is Scoped
//   (one instance per HTTP request). Any class that holds a Scoped dependency
//   must itself be Scoped — a Singleton capturing a Scoped service is a bug
//   that .NET 10 catches at startup with ValidateOnBuild.
// ══════════════════════════════════════════════════════════════════════════════

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBookingFeature(
        this IServiceCollection services)
    {
        services.AddScoped<IBookingService, BookingService>();
        services.AddScoped<IBookingRepository, BookingRepository>();
        return services;
    }

    public static IServiceCollection AddRoomFeature(
        this IServiceCollection services)
    {
        services.AddScoped<IRoomService, RoomService>();
        services.AddScoped<IRoomRepository, RoomRepository>();
        return services;
    }
}
