using RepairCenterPortal.Models.Models;

namespace RepairCenterPortal.Services.Interfaces
{
    public interface IRepairTicketService
    {
        Task<RepairTicket?> GetRepairStatusForAiAsync(string ticketNumber);
        Task<IEnumerable<RepairTicket>> GetAllTicketsAsync();
        Task<RepairTicket> CreateNewTicketAsync(RepairTicket ticket);
    }
}
