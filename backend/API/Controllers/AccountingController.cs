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

        public AccountingController(ApplicationDbContext context, ICustomerLedgerService customerLedgerService, ICompanyLedgerService companyLedgerService)
        {
            _context = context;
            _customerLedgerService = customerLedgerService;
            _companyLedgerService = companyLedgerService;
        }

        [HttpGet("profit-loss")]
        public async Task<IActionResult> GetProfitLoss([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;

            var invoices = await _context.Invoices
                .Where(i => i.InvoiceDate >= start && i.InvoiceDate <= end)
                .Include(i => i.InvoiceItems)
                .ThenInclude(ii => ii.Product)
                .ToListAsync();

            decimal revenue = invoices.Sum(i => i.NetAmount);
            decimal cogs = invoices.SelectMany(i => i.InvoiceItems)
                .Sum(ii => ii.Quantity * (ii.Product?.PurchasePrice ?? 0));

            decimal expenses = await _context.DailyExpenses
                .Where(e => e.ExpenseDate >= start && e.ExpenseDate <= end)
                .SumAsync(e => e.Amount);

            return Ok(new
            {
                Revenue = revenue,
                CostOfGoodsSold = cogs,
                OperatingExpenses = expenses,
                GrossProfit = revenue - cogs,
                NetProfit = revenue - cogs - expenses,
                MarginPercent = revenue > 0 ? ((revenue - cogs) / revenue) * 100 : 0
            });
        }

        [HttpGet("cash-flow")]
        public async Task<IActionResult> GetCashFlow([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;

            decimal cashIn = await _context.Payments
                .Where(p => p.PaymentDate >= start && p.PaymentDate <= end)
                .SumAsync(p => p.AmountPaid);

            decimal dailyExp = await _context.DailyExpenses
                .Where(e => e.ExpenseDate >= start && e.ExpenseDate <= end)
                .SumAsync(e => e.Amount);

            decimal supplierPayments = await _context.CompanyLedgers
                .Where(cl => cl.Date >= start && cl.Date <= end && cl.TransactionType == TransactionType.Debit)
                .SumAsync(cl => cl.Amount);

            return Ok(new
            {
                CashInflow = cashIn,
                CashOutflow = dailyExp + supplierPayments,
                NetCashFlow = cashIn - (dailyExp + supplierPayments)
            });
        }

        [HttpGet("balance-sheet")]
        public async Task<IActionResult> GetBalanceSheet()
        {
            // Asset Calculation
            decimal totalCashIn = await _context.Payments.SumAsync(p => p.AmountPaid);
            decimal totalDailyExp = await _context.DailyExpenses.SumAsync(e => e.Amount);
            decimal totalSupplierPayments = await _context.CompanyLedgers
                .Where(cl => cl.TransactionType == TransactionType.Debit)
                .SumAsync(cl => cl.Amount);

            decimal cashAsset = totalCashIn - totalDailyExp - totalSupplierPayments;

            decimal inventoryValue = await _context.Products
                .Include(p => p.Stock)
                .SumAsync(p => (p.Stock != null ? p.Stock.Quantity : 0) * p.PurchasePrice);

            // Liability Calculation
            decimal totalLiabilityAmount = await _context.CompanyLedgers
                .Where(cl => cl.TransactionType == TransactionType.Credit)
                .SumAsync(cl => cl.Amount);

            decimal accountsPayable = totalLiabilityAmount - totalSupplierPayments;

            return Ok(new
            {
                Assets = new 
                { 
                    Cash = cashAsset, 
                    Inventory = inventoryValue, 
                    Total = cashAsset + inventoryValue 
                },
                Liabilities = new 
                { 
                    AccountsPayable = accountsPayable, 
                    Total = accountsPayable 
                },
                Equity = (cashAsset + inventoryValue) - accountsPayable
            });
        }

        [HttpGet("customer-ledger/{customerId}")]
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
