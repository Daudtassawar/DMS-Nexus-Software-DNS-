using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DMS.Application.Interfaces;
using DMS.Domain.Entities;

namespace DMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DistributorsController : ControllerBase
    {
        private readonly IDistributorService _distributorService;
        private readonly IAuditLogService _auditLogService;

        public DistributorsController(IDistributorService distributorService, IAuditLogService auditLogService)
        {
            _distributorService = distributorService;
            _auditLogService = auditLogService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Distributor>>> GetDistributors()
        {
            var distributors = await _distributorService.GetAllDistributorsAsync();
            return Ok(distributors);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Distributor>> GetDistributor(int id)
        {
            var distributor = await _distributorService.GetDistributorByIdAsync(id);
            if (distributor == null) return NotFound();
            return Ok(distributor);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<Distributor>> CreateDistributor(Distributor distributor)
        {
            var created = await _distributorService.CreateDistributorAsync(distributor);
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "unknown";
            var userName = User.FindFirstValue(ClaimTypes.Name) ?? userId;
            await _auditLogService.LogActionAsync(userId, userName, "Create Distributor", "Distributors",
                $"Created distributor '{distributor.Name}'", created.DistributorId.ToString(),
                HttpContext.Connection.RemoteIpAddress?.ToString());
            return CreatedAtAction(nameof(GetDistributor), new { id = created.DistributorId }, created);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> UpdateDistributor(int id, Distributor updatedDistributor)
        {
            if (id != updatedDistributor.DistributorId) return BadRequest("ID Mismatch");
            var result = await _distributorService.UpdateDistributorAsync(id, updatedDistributor);
            if (result == null) return NotFound();

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "unknown";
            var userName = User.FindFirstValue(ClaimTypes.Name) ?? userId;
            await _auditLogService.LogActionAsync(userId, userName, "Update Distributor", "Distributors",
                $"Updated distributor '{updatedDistributor.Name}'", id.ToString(),
                HttpContext.Connection.RemoteIpAddress?.ToString());
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> DeleteDistributor(int id)
        {
            var deleted = await _distributorService.DeleteDistributorAsync(id);
            if (!deleted) return NotFound();

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "unknown";
            var userName = User.FindFirstValue(ClaimTypes.Name) ?? userId;
            await _auditLogService.LogActionAsync(userId, userName, "Delete Distributor", "Distributors",
                $"Deleted distributor ID {id}", id.ToString(),
                HttpContext.Connection.RemoteIpAddress?.ToString());
            return NoContent();
        }

        [HttpGet("{id}/performance")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetDistributorPerformance(int id)
        {
            try {
                var performance = await _distributorService.GetDistributorPerformanceAsync(id);
                return Ok(performance);
            } catch (System.InvalidOperationException) {
                return NotFound();
            }
        }
    }
}
