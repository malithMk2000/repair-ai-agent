using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RepairCenterPortal.Migrations
{
    /// <inheritdoc />
    public partial class AddExtraFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "ActualCost",
                table: "RepairTickets",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EstimatedDeliveryDate",
                table: "RepairTickets",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IssuesFound",
                table: "RepairTickets",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SpecialNotes",
                table: "RepairTickets",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActualCost",
                table: "RepairTickets");

            migrationBuilder.DropColumn(
                name: "EstimatedDeliveryDate",
                table: "RepairTickets");

            migrationBuilder.DropColumn(
                name: "IssuesFound",
                table: "RepairTickets");

            migrationBuilder.DropColumn(
                name: "SpecialNotes",
                table: "RepairTickets");
        }
    }
}
