using RepairCenterPortal.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace RepairCenterPortal.Models.Models
{
    public class RepairTicket
    {
        [Key]
        public int Id { get; set; }

        [MaxLength(20)]
        public string? TicketNumber { get; set; } = string.Empty; // e.g., "REP-4092"

        public int DeviceId { get; set; }
        public Device? Device { get; set; }

        public RepairStatus Status { get; set; } = RepairStatus.Received;

        public decimal? EstimatedCost { get; set; }
        public decimal? ActualCost { get; set; }
        public decimal? FinalCost { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? EstimatedCompletionDate { get; set; }
        public DateTime? EstimatedDeliveryDate { get; set; }

        public string? DiagnosticNotes { get; set; }
        public string? IssuesFound { get; set; }
        public string? SpecialNotes { get; set; }
    }
}
