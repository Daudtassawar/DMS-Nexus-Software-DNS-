using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DMS.Application.Interfaces;
using DMS.Infrastructure.Authorization;

namespace DMS.API.Controllers
{
    [ApiController]
    [Route("api/audit-logs")]
    [Authorize]
    public class AuditLogsController : ControllerBase
    {
        private readonly IAuditLogService _auditLogService;

        public AuditLogsController(IAuditLogService auditLogService)
        {
            _auditLogService = auditLogService;
        }

        /// <summary>
        /// GET /api/audit-logs?userId=&module=&fromDate=&toDate=
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetLogs(
            [FromQuery] string? userId,
            [FromQuery] string? module,
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate)
        {
            var logs = await _auditLogService.GetLogsAsync(userId, module, fromDate, toDate);
            return Ok(logs);
        }
    }
}
