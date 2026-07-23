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

        // PUT: api/tickets/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTicket(int id, [FromBody] RepairTicket updatedTicket)
        {
            if (id != updatedTicket.Id)
            {
                return BadRequest("ID mismatch");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await _repairService.UpdateTicketAsync(updatedTicket);
            return NoContent();
        }

        // DELETE: api/tickets/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTicket(int id)
        {
            await _repairService.DeleteTicketAsync(id);
            return NoContent();
        }

        [HttpGet("number/{ticketNumber}")]
        public async Task<IActionResult> GetByTicketNumber(string ticketNumber)
        {
            if (string.IsNullOrWhiteSpace(ticketNumber))
            {
                return BadRequest("Ticket number cannot be empty.");
            }

            var ticket = await _repairService.GetRepairStatusForAiAsync(ticketNumber);

            if (ticket == null)
            {
                return NotFound($"Repair ticket {ticketNumber} was not found.");
            }

            return Ok(ticket);
        }
    }
}
