using RepairCenterPortal.Models.Models;
using RepairCenterPortal.Repositories.Interfaces;
using RepairCenterPortal.Services.Interfaces;

namespace RepairCenterPortal.Services.Repositories
{
    public class RepairTicketService : IRepairTicketService
    {
        private readonly IRepairTicketRepository _repository;

        // Dependency Injection of the Repository
        public RepairTicketService(IRepairTicketRepository repository)
        {
            _repository = repository;
        }

        public async Task<RepairTicket?> GetRepairStatusForAiAsync(string ticketNumber)
        {
            // Business rule: Standardize ticket number format before searching
            var formattedTicket = ticketNumber.Trim().ToUpper();

            return await _repository.GetByTicketNumberAsync(formattedTicket);
        }

        public async Task<IEnumerable<RepairTicket>> GetAllTicketsAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<RepairTicket> CreateNewTicketAsync(RepairTicket ticket)
        {
            // Business rule: Auto-generate a unique ticket number if it doesn't exist
            if (string.IsNullOrEmpty(ticket.TicketNumber))
            {
                // Simple generation: "REP-20260415-XXXX"
                var randomNum = new Random().Next(1000, 9999);
                ticket.TicketNumber = $"REP-{DateTime.Now:yyyyMMdd}-{randomNum}";
            }

            ticket.CreatedAt = DateTime.UtcNow;
            return await _repository.AddAsync(ticket);
        }

        public async Task UpdateTicketAsync(RepairTicket ticket)
        {
            await _repository.UpdateAsync(ticket);
        }

        public async Task DeleteTicketAsync(int id)
        {
            await _repository.DeleteAsync(id);
        }
    }
}
