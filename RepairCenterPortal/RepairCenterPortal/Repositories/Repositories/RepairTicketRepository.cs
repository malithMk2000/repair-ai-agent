using RepairCenterPortal.Infrastructure;
using RepairCenterPortal.Models.Enums;
using RepairCenterPortal.Models.Models;
using RepairCenterPortal.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace RepairCenterPortal.Repositories.Repositories
{
    public class RepairTicketRepository : IRepairTicketRepository
    {
        private readonly RepairDbContext _context;

        public RepairTicketRepository(RepairDbContext context)
        {
            _context = context;
        }

        public async Task<RepairTicket?> GetByTicketNumberAsync(string ticketNumber)
        {
            return await _context.RepairTickets
                .Include(r => r.Device)
                .ThenInclude(d => d.Customer)
                .FirstOrDefaultAsync(r => r.TicketNumber == ticketNumber);
        }

        public async Task<IEnumerable<RepairTicket>> GetActiveTicketsByPhoneAsync(string phoneNumber)
        {
            return await _context.RepairTickets
                .Include(r => r.Device)
                .ThenInclude(d => d.Customer)
                .Where(r => r.Device!.Customer!.PhoneNumber == phoneNumber &&
                            r.Status != RepairStatus.Completed &&
                            r.Status != RepairStatus.Cancelled)
                .ToListAsync();
        }

        public async Task UpdateAsync(RepairTicket ticket)
        {
            _context.RepairTickets.Update(ticket);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<RepairTicket>> GetAllAsync()
        {
            return await _context.RepairTickets
                .Include(r => r.Device)
                .ThenInclude(d => d.Customer)
                .OrderByDescending(r => r.CreatedAt) // Newest tickets first
                .ToListAsync();
        }

        public async Task<RepairTicket> AddAsync(RepairTicket ticket)
        {
            await _context.RepairTickets.AddAsync(ticket);
            await _context.SaveChangesAsync();
            return ticket;
        }
    }
}
