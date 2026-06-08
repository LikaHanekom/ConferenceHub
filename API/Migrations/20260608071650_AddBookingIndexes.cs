using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "ix_bookings_time_range",
                table: "bookings",
                columns: new[] { "StartTime", "EndTime" });

            migrationBuilder.CreateIndex(
                name: "ix_bookings_type",
                table: "bookings",
                column: "Type");

            migrationBuilder.AddCheckConstraint(
                name: "ck_bookings_endtime_after_starttime",
                table: "bookings",
                sql: "\"EndTime\" > \"StartTime\"");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_bookings_time_range",
                table: "bookings");

            migrationBuilder.DropIndex(
                name: "ix_bookings_type",
                table: "bookings");

            migrationBuilder.DropCheckConstraint(
                name: "ck_bookings_endtime_after_starttime",
                table: "bookings");
        }
    }
}
