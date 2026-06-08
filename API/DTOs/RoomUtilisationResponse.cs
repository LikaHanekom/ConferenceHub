namespace API.DTOs;

public record RoomUtilisationResponse(
    string RoomName,
    long   BookingCount,
    double TotalHours,
    long   UsageRank
);
