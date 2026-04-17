using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Application.Interfaces;
using DMS.Domain.Entities;
using DMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DMS.Application.Services
{
    public class DailyOperationsService
    {
        private readonly IDailyOperationsRepository _repository;
        private readonly ApplicationDbContext _context;
        private readonly IFinancialService _financialService;

        public DailyOperationsService(IDailyOperationsRepository repository, ApplicationDbContext context, IFinancialService financialService)
        {
            _repository = repository;
            _context = context;
            _financialService = financialService;
        }

        public async Task<DailyActivity> LogActivityAsync(string title, string description, string userName)
        {
            var activity = new DailyActivity
            {
                Title = title,
                Description = description,
                ActivityDate = DateTime.UtcNow,
                CreatedBy = userName
            };
            await _repository.AddActivityAsync(activity);
            await _repository.SaveChangesAsync();
            return activity;
        }

        public async Task<IEnumerable<DailyActivity>> GetRecentActivitiesAsync()
        {
            return await _repository.GetActivitiesAsync();
        }

        public async Task<DailyExpense> RecordExpenseAsync(string title, string category, decimal amount, string? notes)
        {
            var expense = new DailyExpense
            {
                ExpenseTitle = title,
                Category = category,
                Amount = amount,
                ExpenseDate = DateTime.UtcNow,
                Notes = notes
            };
            await _repository.AddExpenseAsync(expense);
            await _repository.SaveChangesAsync();
            return expense;
        }

        public async Task<IEnumerable<DailyExpense>> GetRecentExpensesAsync()
        {
            return await _repository.GetExpensesAsync();
        }

        public async Task<DailyActivity> UpdateActivityAsync(int id, string title, string description)
        {
            var activity = await _context.DailyActivities.FindAsync(id);
            if (activity == null) throw new Exception("Activity not found");

            activity.Title = title;
            activity.Description = description;
            _context.DailyActivities.Update(activity);
            await _context.SaveChangesAsync();
            return activity;
        }

        public async Task DeleteActivityAsync(int id)
        {
            var activity = await _context.DailyActivities.FindAsync(id);
            if (activity == null) throw new Exception("Activity not found");

            _context.DailyActivities.Remove(activity);
            await _context.SaveChangesAsync();
        }

        public async Task<DailyExpense> UpdateExpenseAsync(int id, string title, string category, decimal amount, string? notes)
        {
            var expense = await _context.DailyExpenses.FindAsync(id);
            if (expense == null) throw new Exception("Expense not found");

            expense.ExpenseTitle = title;
            expense.Category = category;
            expense.Amount = amount;
            expense.Notes = notes;
            _context.DailyExpenses.Update(expense);
            await _context.SaveChangesAsync();
            return expense;
        }

        public async Task DeleteExpenseAsync(int id)
        {
            var expense = await _context.DailyExpenses.FindAsync(id);
            if (expense == null) throw new Exception("Expense not found");

            _context.DailyExpenses.Remove(expense);
            await _context.SaveChangesAsync();
        }

        public async Task<object> GetCashSummaryAsync()
        {
            var today = DateTime.UtcNow.Date;
            
            var salesToday = await _context.Invoices
                .Where(i => i.InvoiceDate.Date == today && i.PaymentStatus != "Cancelled")
                .SumAsync(i => i.NetAmount);

            var paymentsReceived = await _context.Payments
                .Include(p => p.Invoice)
                .Where(p => p.PaymentDate.Date == today && p.Invoice.PaymentStatus != "Cancelled")
                .SumAsync(p => p.AmountPaid);

            var expensesToday = await _context.DailyExpenses
                .Where(e => e.ExpenseDate.Date == today)
                .SumAsync(e => e.Amount);

            return new
            {
                TotalSalesToday = salesToday,
                TotalPaymentsReceived = paymentsReceived,
                TotalExpensesToday = expensesToday,
                CashInHand = paymentsReceived - expensesToday
            };
        }

        public async Task<object> GetDailyBusinessReportAsync()
        {
            var today = DateTime.UtcNow.Date;

            var invoicesToday = await _context.Invoices
                .Include(i => i.InvoiceItems)
                    .ThenInclude(ii => ii.Product)
                .Include(i => i.Customer)
                .Where(i => i.InvoiceDate.Date == today && i.PaymentStatus != "Cancelled")
                .ToListAsync();

            var salesToday = invoicesToday.Sum(i => i.NetAmount);
            var expensesToday = await _context.DailyExpenses
                .Where(e => e.ExpenseDate.Date == today)
                .SumAsync(e => e.Amount);

            // Accurately calculate profit using the new service
            var pl = await _financialService.GetProfitLossAsync(today, today.AddDays(1).AddSeconds(-1));

            // Top Product Today
            var topProduct = invoicesToday
                .SelectMany(i => i.InvoiceItems)
                .GroupBy(it => it.Product?.ProductName ?? "Unknown")
                .OrderByDescending(g => g.Sum(it => it.Quantity))
                .Select(g => g.Key)
                .FirstOrDefault() ?? "N/A";

            // Top Customer Today
            var topCustomer = invoicesToday
                .GroupBy(i => i.Customer?.CustomerName ?? "Unknown")
                .OrderByDescending(g => g.Sum(i => i.NetAmount))
                .Select(g => g.Key)
                .FirstOrDefault() ?? "N/A";

            return new
            {
                SalesToday = salesToday,
                InvoicesToday = invoicesToday.Count,
                ExpensesToday = expensesToday,
                TopProduct = topProduct,
                TopCustomer = topCustomer,
                NetProfit = pl.NetProfit
            };
        }
    }
}
