using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DMS.Application.Interfaces;
using DMS.Infrastructure.Data;
using DMS.Domain.Entities;

namespace DMS.Application.Services
{
    public class FinancialService : IFinancialService
    {
        private readonly ApplicationDbContext _context;

        public FinancialService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ProfitLossResult> GetProfitLossAsync(DateTime start, DateTime end)
        {
            var startUtc = start.ToUniversalTime();
            var endUtc = end.ToUniversalTime();

            // Revenue: Sum of NetAmount of all non-cancelled invoices
            var revenue = await _context.Invoices
                .Where(i => i.InvoiceDate >= startUtc && i.InvoiceDate <= endUtc && i.PaymentStatus != "Cancelled")
                .SumAsync(i => i.NetAmount);

            // COGS: Sum of (Quantity * PurchasePrice) for non-cancelled invoices
            // Note: We use IQueryable to ensure calculation happens in database
            var cogs = await _context.InvoiceItems
                .Include(ii => ii.Product)
                .Where(ii => ii.Invoice.InvoiceDate >= startUtc && ii.Invoice.InvoiceDate <= endUtc && ii.Invoice.PaymentStatus != "Cancelled")
                .SumAsync(ii => ii.Quantity * (ii.Product != null ? ii.Product.PurchasePrice : 0));

            // Expenses: Sum of DailyExpenses
            var expenses = await _context.DailyExpenses
                .Where(e => e.ExpenseDate >= startUtc && e.ExpenseDate <= endUtc)
                .SumAsync(e => e.Amount);

            return new ProfitLossResult
            {
                Revenue = revenue,
                CostOfGoodsSold = cogs,
                OperatingExpenses = expenses
            };
        }

        public async Task<CashFlowResult> GetCashFlowAsync(DateTime start, DateTime end)
        {
            var startUtc = start.ToUniversalTime();
            var endUtc = end.ToUniversalTime();

            // Cash Inflow: Payments received (on non-cancelled invoices)
            var cashIn = await _context.Payments
                .Include(p => p.Invoice)
                .Where(p => p.PaymentDate >= startUtc && p.PaymentDate <= endUtc && p.Invoice.PaymentStatus != "Cancelled")
                .SumAsync(p => p.AmountPaid);

            // Cash Outflow: Expenses + Supplier Payments
            var dailyExpenses = await _context.DailyExpenses
                .Where(e => e.ExpenseDate >= startUtc && e.ExpenseDate <= endUtc)
                .SumAsync(e => e.Amount);

            var supplierPayments = await _context.CompanyLedgers
                .Where(cl => cl.Date >= startUtc && cl.Date <= endUtc && cl.TransactionType == TransactionType.Debit)
                .SumAsync(cl => cl.Amount);

            return new CashFlowResult
            {
                CashInflow = cashIn,
                CashOutflow = dailyExpenses + supplierPayments
            };
        }

        public async Task<IEnumerable<string>> GetFinancialInsightsAsync()
        {
            var today = DateTime.UtcNow.Date;
            var yesterday = today.AddDays(-1);

            var todaySales = await _context.Invoices
                .Where(i => i.InvoiceDate.Date == today && i.PaymentStatus != "Cancelled")
                .SumAsync(i => i.NetAmount);

            var yesterdaySales = await _context.Invoices
                .Where(i => i.InvoiceDate.Date == yesterday && i.PaymentStatus != "Cancelled")
                .SumAsync(i => i.NetAmount);

            var insights = new List<string>();

            if (todaySales > yesterdaySales && yesterdaySales > 0)
            {
                var growth = ((todaySales - yesterdaySales) / yesterdaySales) * 100;
                insights.Add($"Sales increased by {growth:F1}% compared to yesterday.");
            }
            else if (todaySales < yesterdaySales && todaySales > 0)
            {
                insights.Add("Sales are lower than yesterday. Consider volume boost strategies.");
            }
            else if (todaySales == 0)
            {
                insights.Add("No sales recorded today yet.");
            }

            // Top Product Today
            var topProduct = await _context.InvoiceItems
                .Include(ii => ii.Product)
                .Where(ii => ii.Invoice.InvoiceDate.Date == today && ii.Invoice.PaymentStatus != "Cancelled")
                .GroupBy(ii => ii.ProductId)
                .Select(g => new { 
                    Name = g.First().Product != null ? g.First().Product.ProductName : "Unknown", 
                    Profit = g.Sum(ii => ii.Quantity * (ii.UnitPrice - (ii.Product != null ? ii.Product.PurchasePrice : 0))) 
                })
                .OrderByDescending(x => x.Profit)
                .FirstOrDefaultAsync();

            if (topProduct != null && topProduct.Name != "Unknown") 
                insights.Add($"'{topProduct.Name}' is your most profitable product today.");

            return insights;
        }

        public async Task<SalesForecastResult> GetSalesForecastAsync()
        {
            var startRange = DateTime.UtcNow.AddDays(-30).Date;

            var history = await _context.Invoices
                .Where(i => i.InvoiceDate >= startRange && i.PaymentStatus != "Cancelled")
                .GroupBy(i => i.InvoiceDate.Date)
                .Select(g => new { Date = g.Key, Amount = g.Sum(i => i.NetAmount) })
                .OrderBy(x => x.Date)
                .ToListAsync();

            if (!history.Any()) return new SalesForecastResult();

            decimal avgDaily = history.Average(x => x.Amount);
            
            var forecast = Enumerable.Range(1, 7).Select(i => new {
                Date = DateTime.UtcNow.Date.AddDays(i),
                PredictedAmount = Math.Round(avgDaily * (decimal)(1 + (0.012 * i)), 2) // Conservative 1.2% daily growth factor
            });

            return new SalesForecastResult
            {
                Historical = history,
                Forecast = forecast
            };
        }

        public async Task<object> GetBalanceSheetAsync()
        {
            // Simplified Balance Sheet logic
            decimal totalCashIn = await _context.Payments
                .Include(p => p.Invoice)
                .Where(p => p.Invoice.PaymentStatus != "Cancelled")
                .SumAsync(p => p.AmountPaid);

            decimal totalDailyExp = await _context.DailyExpenses.SumAsync(e => e.Amount);
            
            decimal totalSupplierPayments = await _context.CompanyLedgers
                .Where(cl => cl.TransactionType == TransactionType.Debit)
                .SumAsync(cl => cl.Amount);

            decimal cashAsset = totalCashIn - totalDailyExp - totalSupplierPayments;

            decimal inventoryValue = await _context.Stock
                .Include(s => s.Product)
                .SumAsync(s => s.Quantity * (s.Product != null ? s.Product.PurchasePrice : 0));

            decimal accountsReceivable = await _context.Customers.SumAsync(c => c.Balance);

            decimal accountsPayable = await _context.CompanyLedgers
                .Where(cl => cl.TransactionType == TransactionType.Credit)
                .SumAsync(cl => cl.Amount) - totalSupplierPayments;

            return new
            {
                Assets = new { 
                    Cash = cashAsset, 
                    Inventory = inventoryValue, 
                    AccountsReceivable = accountsReceivable,
                    Total = cashAsset + inventoryValue + accountsReceivable 
                },
                Liabilities = new { 
                    AccountsPayable = Math.Max(0, accountsPayable), 
                    Total = Math.Max(0, accountsPayable) 
                },
                Equity = (cashAsset + inventoryValue + accountsReceivable) - Math.Max(0, accountsPayable)
            };
        }
    }
}
