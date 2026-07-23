using RepairCenterPortal.Models.Models;

namespace RepairCenterPortal.Repositories.Interfaces
{
    public interface IRepairTicketRepository
    {
        Task<RepairTicket?> GetByTicketNumberAsync(string ticketNumber);
        Task<IEnumerable<RepairTicket>> GetActiveTicketsByPhoneAsync(string phoneNumber);
        Task UpdateAsync(RepairTicket ticket);
        Task DeleteAsync(int id);
        Task<IEnumerable<RepairTicket>> GetAllAsync();
        Task<RepairTicket> AddAsync(RepairTicket ticket);
    }
}
