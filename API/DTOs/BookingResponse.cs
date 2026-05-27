using System.ComponentModel.DataAnnotations;
using API.Models;

namespace API.DTOs;

//this mirrors our Booking Domain but doesnt give firect access to the domain entity

public record BookingResponse
(
    Guid id,
    string Title,
    string Speaker, 
    string Room, 
    DateTime startTime
); 
