using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DMS.Application.Interfaces;
using DMS.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Infrastructure.Authorization;

namespace DMS.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class SalesmenController : ControllerBase
    {
        private readonly ISalesmanService _salesmanService;

        public SalesmenController(ISalesmanService salesmanService)
        {
            _salesmanService = salesmanService;
        }

        // GET: api/v1/Salesmen
        [HttpGet]
        [RequirePermission("Salesmen.View")]
        public async Task<ActionResult<IEnumerable<Salesman>>> GetSalesmen()
        {
            var salesmen = await _salesmanService.GetAllSalesmenAsync();
            return Ok(salesmen);
        }

        // GET: api/v1/Salesmen/5
        [HttpGet("{id}")]
        [RequirePermission("Salesmen.View")]
        public async Task<ActionResult<Salesman>> GetSalesman(int id)
        {
            var salesman = await _salesmanService.GetSalesmanByIdAsync(id);
            if (salesman == null) return NotFound();
            return Ok(salesman);
        }

        // POST: api/v1/Salesmen
        [HttpPost]
        [RequirePermission("Users.Create")] // Reuses users permission as salesman is a core system entity
        public async Task<ActionResult<Salesman>> PostSalesman(Salesman salesman)
        {
            var created = await _salesmanService.CreateSalesmanAsync(salesman);
            return CreatedAtAction(nameof(GetSalesman), new { id = created.SalesmanId }, created);
        }

        // PUT: api/v1/Salesmen/5
        [HttpPut("{id}")]
        [RequirePermission("Users.Edit")] // Reuses users permission
        public async Task<IActionResult> PutSalesman(int id, Salesman salesman)
        {
            if (id != salesman.SalesmanId) return BadRequest();
            await _salesmanService.UpdateSalesmanAsync(salesman);
            return NoContent();
        }

        // DELETE: api/v1/Salesmen/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> DeleteSalesman(int id)
        {
            await _salesmanService.DeleteSalesmanAsync(id);
            return NoContent();
        }

        [HttpGet("{id}/performance")]
        public async Task<IActionResult> GetSalesmanPerformance(int id, [FromQuery] int year, [FromQuery] int month)
        {
            var performance = await _salesmanService.GetSalesmanPerformanceAsync(id, year, month);
            if (performance == null) return NotFound();
            return Ok(performance);
        }

        [HttpPut("{id}/customers")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> AssignCustomers(int id, [FromBody] List<int> customerIds)
        {
            await _salesmanService.AssignCustomersAsync(id, customerIds);
            return NoContent();
        }
    }
}
