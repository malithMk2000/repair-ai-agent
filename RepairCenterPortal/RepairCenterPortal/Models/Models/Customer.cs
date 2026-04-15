using System.ComponentModel.DataAnnotations;

namespace RepairCenterPortal.Models.Models
{
    public class Customer
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        public string? Email { get; set; }

        // Navigation property: A customer can have multiple devices
        public List<Device> Devices { get; set; } = new();
    }
}
