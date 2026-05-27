using System.ComponentModel.DataAnnotations;
using API.Models; 

namespace API.DTOs;

//Request Dto - What the client sends to the backend to create a booking

public record CreateBookingRequest(

    [Required(ErrorMessage = "Title is required")]
    [MaxLength(100, ErrorMessage = "Title cannot exceed 100 characters")]
    string Title,

    string Speaker,
    [Required(ErrorMessage ="Room is required to secure a booking")]
    string Room, 
    [Required(ErrorMessage = "Start time is required")]
    DateTime? StartTime //deafult value == Datetime.MinValue
); 