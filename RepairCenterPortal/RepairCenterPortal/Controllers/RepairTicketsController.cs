using Microsoft.AspNetCore.Mvc;
using RepairCenterPortal.Models.Models;
using RepairCenterPortal.Services.Interfaces;

namespace RepairCenterPortal.Controllers
{
    [ApiController]
    [Route("api/tickets")] // This is for the React app, keeping it separate from /api/internal/
    public class RepairTicketsController : ControllerBase
    {
        private readonly IRepairTicketService _repairService;

        public RepairTicketsController(IRepairTicketService repairService)
        {
            _repairService = repairService;
        }

        // GET: api/tickets
        [HttpGet]
        public async Task<IActionResult> GetAllTickets()
        {
            var tickets = await _repairService.GetAllTicketsAsync();
            return Ok(tickets);
        }

        // POST: api/tickets
        [HttpPost]
        public async Task<IActionResult> CreateTicket([FromBody] RepairTicket newTicket)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdTicket = await _repairService.CreateNewTicketAsync(newTicket);

            return CreatedAtAction(nameof(GetAllTickets), new { id = createdTicket.Id }, createdTicket);
        }
    }
}
