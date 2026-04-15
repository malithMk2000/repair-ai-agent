using System.ComponentModel.DataAnnotations;

namespace RepairCenterPortal.Models.Models
{
    public class Device
    {
        [Key]
        public int Id { get; set; }

        public int CustomerId { get; set; }
        public Customer? Customer { get; set; }

        [Required]
        [MaxLength(50)]
        public string Brand { get; set; } = "Samsung"; // Defaulting to Samsung based on your use case

        [Required]
        [MaxLength(100)]
        public string Model { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? SerialNumber { get; set; }

        // Navigation property
        public List<RepairTicket> RepairTickets { get; set; } = new();
    }
}
