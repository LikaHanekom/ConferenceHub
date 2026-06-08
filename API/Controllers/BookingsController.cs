using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using API.DTOs;
using API.Models;
using API.Services;

namespace API.Controllers;

// Role definitions for this system:
//   Employee          — can view and create bookings
//   Receptionist      — can view, create, and update bookings (manages visitor registrations)
//   FacilitiesManager — can view, create, and update bookings (manages maintenance windows)
//   Admin             — full access, including delete

[ApiController]
[Route("api/[controller]")]
public class BookingsController(IBookingService bookingService) : ControllerBase
{
    // ── IActionResult vs ActionResult<T> comparison (teaching reference) ──────
    // PATTERN A: IActionResult — flexible but OpenAPI cannot infer the response shape.
    [HttpGet("v-iactionresult")]
    public async Task<IActionResult> GetBookings_Untyped()
    {
        var bookings = await bookingService.GetAllAsync();
        return Ok(bookings); // OpenAPI shows response body as "any" — not helpful for client generation
    }

    // PATTERN B: ActionResult<T> — OpenAPI knows the exact response shape. Use this everywhere.

    // ── GET /api/bookings ─────────────────────────────────────────────────────
    // Anonymous — the conference schedule is public. No token required.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookingResponse>>> GetBookingsAsync() =>
        Ok(await bookingService.GetAllAsync());

    // ── GET /api/bookings/search ──────────────────────────────────────────────
    // Optional filters for the receptionist's schedule view.
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<BookingResponse>>> SearchBookingsAsync(
        [FromQuery] string?      roomName,
        [FromQuery] BookingType? type,
        [FromQuery] DateTime?    from,
        [FromQuery] DateTime?    to,
        [FromQuery] string?      q) =>
        Ok(await bookingService.SearchAsync(new BookingSearchQuery(roomName, type, from, to, q)));

    // ── GET /api/bookings/{id} ────────────────────────────────────────────────
    // Returns full booking detail including room equipment and all attendees.
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BookingDetailResponse>> GetBookingByIdAsync(Guid id) =>
        Ok(await bookingService.GetByIdAsync(id));

    // ── POST /api/bookings ────────────────────────────────────────────────────
    // Employees, Receptionists, FacilitiesManagers, and Admins can create bookings.
    [Authorize(Roles = "Employee,Receptionist,FacilitiesManager,Admin")]
    [HttpPost]
    public async Task<ActionResult<BookingResponse>> CreateBookingAsync(
        [FromBody] CreateBookingRequest request)
    {
        var response = await bookingService.CreateAsync(request);
        return CreatedAtAction(nameof(GetBookingByIdAsync), new { id = response.Id }, response);
    }

    // ── PUT /api/bookings/{id} ────────────────────────────────────────────────
    // Receptionists update on behalf of attendees; FacilitiesManagers reschedule maintenance.
    [Authorize(Roles = "Receptionist,FacilitiesManager,Admin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<BookingResponse>> UpdateBookingAsync(
        Guid id,
        [FromBody] CreateBookingRequest request) =>
        Ok(await bookingService.UpdateAsync(id, request));

    // ── DELETE /api/bookings/{id} ─────────────────────────────────────────────
    // Admin only — deletion is irreversible.
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteBookingAsync(Guid id)
    {
        await bookingService.DeleteAsync(id);
        return NoContent(); // 204 — operation succeeded, no body returned
    }
}
