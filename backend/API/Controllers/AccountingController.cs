using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DMS.Domain.Entities;
using DMS.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using DMS.Application.Interfaces;
using DMS.Infrastructure.Authorization;

namespace DMS.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(Roles = "Admin,Manager")]
    public class AccountingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ICustomerLedgerService _customerLedgerService;
        private readonly ICompanyLedgerService _companyLedgerService;
        private readonly IFinancialService _financialService;

        public AccountingController(ApplicationDbContext context, 
            ICustomerLedgerService customerLedgerService, 
            ICompanyLedgerService companyLedgerService,
            IFinancialService financialService)
        {
            _context = context;
            _customerLedgerService = customerLedgerService;
            _companyLedgerService = companyLedgerService;
            _financialService = financialService;
        }

        [HttpGet("profit-loss")]
        [Authorize]
        [RequirePermission("Accounting.View")]
        public async Task<IActionResult> GetProfitLoss([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;

            var result = await _financialService.GetProfitLossAsync(start, end);
            return Ok(result);
        }

        [HttpGet("cash-flow")]
        [Authorize]
        [RequirePermission("Accounting.View")]
        public async Task<IActionResult> GetCashFlow([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;

            var result = await _financialService.GetCashFlowAsync(start, end);
            return Ok(result);
        }

        [HttpGet("balance-sheet")]
        [Authorize]
        [RequirePermission("Accounting.View")]
        public async Task<IActionResult> GetBalanceSheet()
        {
            var result = await _financialService.GetBalanceSheetAsync();
            return Ok(result);
        }

        [HttpGet("customer-ledger/{customerId}")]
        [Authorize]
        [RequirePermission("Accounting.View")]
        public async Task<IActionResult> GetCustomerLedger(int customerId)
        {
            try
            {
                var ledger = await _customerLedgerService.GetLedgerByCustomerIdAsync(customerId);
                return Ok(ledger);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("company-ledger/{companyId}")]
        public async Task<IActionResult> GetCompanyLedger(int companyId)
        {
            try
            {
                var ledger = await _companyLedgerService.GetLedgerByCompanyIdAsync(companyId);
                return Ok(ledger);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
