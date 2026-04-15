using RepairCenterPortal.Models.Models;
using System.Collections.Generic;
using System.Reflection.Emit;
using Microsoft.EntityFrameworkCore;

namespace RepairCenterPortal.Infrastructure
{
    public class RepairDbContext : DbContext
    {
        public RepairDbContext(DbContextOptions<RepairDbContext> options) : base(options) { }

        public DbSet<Customer> Customers { get; set; }
        public DbSet<Device> Devices { get; set; }
        public DbSet<RepairTicket> RepairTickets { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Ensure TicketNumber is unique
            modelBuilder.Entity<RepairTicket>()
                .HasIndex(r => r.TicketNumber)
                .IsUnique();

            base.OnModelCreating(modelBuilder);
        }
    }
}
