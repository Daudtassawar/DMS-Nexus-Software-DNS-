using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DMS.Application.Services;
using DMS.Domain.Entities;
using DMS.Infrastructure.Authorization;
using DMS.Application.Interfaces;

namespace DMS.API.Controllers
{
    [ApiController]
    [Route("api/v1/daily-operations")]
    [Authorize(Roles = "Admin,Manager,Salesman")]
    public class DailyOperationsController : ControllerBase
    {
        private readonly DailyOperationsService _service;
        private readonly IAuditLogService _auditLogService;

        public DailyOperationsController(DailyOperationsService service, IAuditLogService auditLogService)
        {
            _service = service;
            _auditLogService = auditLogService;
        }

        [HttpPost("activity")]
        [RequirePermission("Operations.Update")]
        public async Task<IActionResult> LogActivity([FromBody] ActivityRequest req)
        {
            var user = User.Identity?.Name ?? "System";
            var activity = await _service.LogActivityAsync(req.Title, req.Description, user);
            return Ok(activity);
        }

        [HttpGet("activity")]
        [RequirePermission("Operations.View")]
        public async Task<IActionResult> GetActivities()
        {
            return Ok(await _service.GetRecentActivitiesAsync());
        }

        [HttpPost("expense")]
        [RequirePermission("Finance.Update")]
        public async Task<IActionResult> RecordExpense([FromBody] ExpenseRequest req)
        {
            var expense = await _service.RecordExpenseAsync(req.Title, req.Category, req.Amount, req.Notes);
            return Ok(expense);
        }

        [HttpGet("expense")]
        [RequirePermission("Finance.View")]
        public async Task<IActionResult> GetExpenses()
        {
            return Ok(await _service.GetRecentExpensesAsync());
        }

        [HttpGet("cash-summary")]
        [RequirePermission("Finance.View")]
        public async Task<IActionResult> GetCashSummary()
        {
            return Ok(await _service.GetCashSummaryAsync());
        }

        [HttpGet("daily-report")]
        [RequirePermission("Finance.View")]
        public async Task<IActionResult> GetDailyReport()
        {
            return Ok(await _service.GetDailyBusinessReportAsync());
        }

        [HttpPut("activity/{id}")]
        [RequirePermission("Operations.Update")]
        public async Task<IActionResult> UpdateActivity(int id, [FromBody] ActivityRequest req)
        {
            try
            {
                var activity = await _service.UpdateActivityAsync(id, req.Title, req.Description);
                return Ok(activity);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpDelete("activity/{id}")]
        [RequirePermission("Operations.Update")]
        public async Task<IActionResult> DeleteActivity(int id)
        {
            try
            {
                await _service.DeleteActivityAsync(id);
                return Ok(new { Message = "Activity deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // The prompt asked for `/api/operations/task/{id}` but also we use activity internally. I'll add task routes that map to activity routes to be safe
        [HttpPut("task/{id}")]
        [RequirePermission("Operations.Update")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] ActivityRequest req) => await UpdateActivity(id, req);

        [HttpDelete("task/{id}")]
        [RequirePermission("Operations.Update")]
        public async Task<IActionResult> DeleteTask(int id) => await DeleteActivity(id);


        [HttpPut("expense/{id}")]
        [RequirePermission("Finance.Update")]
        public async Task<IActionResult> UpdateExpense(int id, [FromBody] ExpenseRequest req)
        {
            try
            {
                var expense = await _service.UpdateExpenseAsync(id, req.Title, req.Category, req.Amount, req.Notes);

                var currentUserId = User.Identity?.Name ?? "System";
                await _auditLogService.LogActionAsync(currentUserId, $"Expense updates: ID {id} - {req.Title}", HttpContext.Connection.RemoteIpAddress?.ToString());

                return Ok(expense);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpDelete("expense/{id}")]
        [RequirePermission("Finance.Update")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            try
            {
                await _service.DeleteExpenseAsync(id);
                return Ok(new { Message = "Expense deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }

    public class ActivityRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class ExpenseRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? Notes { get; set; }
    }
}
