using Microsoft.AspNetCore.Mvc;
using API.Models;
using API.Data;
using API.DTOs;
using Microsoft.AspNetCore.Components.Web;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    // ── PATTERN A: IActionResult ──────────────────────────────────────
    // Flexible — can return any response type.
    // PROBLEM: OpenAPI cannot infer what data shape is returned.
    // The generated documentation will show an unknown response body.
    [HttpGet("v-iactionresult")]
    public async Task<IActionResult> GetBookings_Untyped()
    {
        await Task.Delay(100);
        return Ok(BookingStore.Bookings); // ← OpenAPI: response body is "any"
    }

    // ── PATTERN B: ActionResult<T> ────────────────────────────────────
    // Typed — wraps both the T and allows returning IActionResult results.
    // OpenAPI knows the exact shape of the success response.
    // This is the correct pattern for all endpoints in this course.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Booking>>> GetBookingsAsync()
    {
        // await does NOT block the thread.
        // It says: "pause this method, return the thread to the pool,
        // and resume here when the I/O finishes."
        await Task.Delay(200); // stands in for: await _db.Bookings.ToListAsync()
        return Ok(BookingStore.Bookings); // HTTP 200 OK — Body: JSON array of Booking objects
    }

    // GET: /api/bookings/{id}
    // The ":guid" constraint means ASP.NET Core will ONLY match this route
    // if the {id} segment is a valid GUID format.
    // /api/bookings/abc         → 400 Bad Request (rejected by framework, never hits our code)
    // /api/bookings/00000000-...→ Hits our code, we handle 404 if not found
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Booking>> GetBookingByIdAsync(Guid id)
    {
        await Task.Delay(50);

        var booking = BookingStore.Bookings.FirstOrDefault(b => b.Id == id);

        // Guard clause: if the resource does not exist, say so explicitly.
        // Never return null. Never return a 200 with an empty body.
        // A 404 tells the client "this thing does not exist" — that is useful information.
        if (booking is null)
        {
            return NotFound(); // HTTP 404 Not Found
        }

        return Ok(booking); // HTTP 200 OK — Body: single Booking object as JSON
    }

    [HttpPost]
   public async Task<ActionResult<BookingResponse>> CreateBookingAsync([FromBody] CreateBookingRequest request)
    {
        await Task.Delay(50); // will replace with an actual database call 

        // 1. IDEMPOTENCY
        // Prevent a duplicate addition of a booking if the client submits the same form twice. 

        bool isDuplicate = BookingStore.Bookings.Any(b => b.Room == request.Room && 
        b.StartTime == request.StartTime);

        if (isDuplicate)
        {
            return Conflict(); // HTTP 409 ~ ProblemDetails service fills in the body
        }
        //2. Map received DTO to actual Domain Model
        var newBooking =  new Booking(
            Guid.NewGuid(),
            request.Title,
            request.Speaker, 
            request.Room,
            request.StartTime!.Value
        );

        //3. Save the Booking
        BookingStore.Bookings.Add(newBooking); 

        //4. Map Domain Model to to Response DTO
        var response = new BookingResponse(
            newBooking.Id,
            newBooking.Title,
            newBooking.Speaker,
            newBooking.Room,
            newBooking.StartTime
        ); 

        //5. return the 201 createed + location header
        //CreatedAtAction sets the location header : Get /api/bookings/{id}

        return CreatedAtAction(nameof(GetBookingByIdAsync), new {id = response.id}, response);



    }

    //Delete : api/bookings/{id}

    [HttpDelete]
    public async Task<ActionResult> DeleteBookingAsync(Guid id)
    {
        await Task.Delay(50);
        
        var booking = BookingStore.Bookings.FirstOrDefault(b => b.Id == id);

        if(booking == null)
        {
            return NotFound(); //HTTP 404 - Problem Details middleware add the body

        }
         
         BookingStore.Bookings.Remove(booking);

         return NoContent(); //Http  204 - operation succeeded and there's nothing to return. 
    }
   [HttpPut("{id:guid}")]
   //Replace certain/all fields in an existing Booking 
   //Body of this method is the same as POST, In the sense that the client sends back the full updated booking. 
    public async Task<ActionResult<BookingResponse>> UpdateBookingAsync(Guid id, [FromBody] CreateBookingRequest request)
    {
        await Task.Delay(50); // will replace with an actual database call 

        // 1. IDEMPOTENCY
        // Prevent a duplicate addition of a booking if the client submits the same form twice. 

        var existingBooking  = BookingStore.Bookings.FirstOrDefault(b => b.Id == id);

        if (existingBooking == null)
        {
            return NotFound(); // HTTP 404 ~ ProblemDetails service fills in the body
        }
        //2. Save the updated fields 
        var updatedBooking = existingBooking with
        {
            Title =  request.Title,
            Speaker = request.Speaker, 
            Room = request.Room,
            StartTime = request.StartTime!.Value
        };

        //3. Remove old booking, and save the updated one
        BookingStore.Bookings.Remove(existingBooking);
        BookingStore.Bookings.Add(updatedBooking);

       

        //4. Map Domain Model to to Response DTO
        var response = new BookingResponse(
            updatedBooking.Id,
            updatedBooking.Title,
            updatedBooking.Speaker,
            updatedBooking.Room,
           updatedBooking.StartTime
        ); 

        //5. return the 201 createed + location header
        //CreatedAtAction sets the location header : Get /api/bookings/{id}

        return Ok(response);



    }
        
   
}
