using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DMS.Application.Interfaces;
using DMS.Domain.Entities;
using DMS.Infrastructure.Data;

namespace DMS.Infrastructure.Repositories
{
    public class DailyOperationsRepository : IDailyOperationsRepository
    {
        private readonly ApplicationDbContext _context;

        public DailyOperationsRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<DailyActivity>> GetActivitiesAsync(DateTime? date = null)
        {
            var query = _context.DailyActivities.AsQueryable();
            if (date.HasValue)
            {
                var targetDate = date.Value.Date;
                query = query.Where(a => a.ActivityDate.Date == targetDate);
            }
            return await query.OrderByDescending(a => a.ActivityDate).ToListAsync();
        }

        public async Task<DailyActivity> AddActivityAsync(DailyActivity activity)
        {
            await _context.DailyActivities.AddAsync(activity);
            return activity;
        }

        public async Task<IEnumerable<DailyExpense>> GetExpensesAsync(DateTime? date = null)
        {
            var query = _context.DailyExpenses.AsQueryable();
            if (date.HasValue)
            {
                var targetDate = date.Value.Date;
                query = query.Where(e => e.ExpenseDate.Date == targetDate);
            }
            return await query.OrderByDescending(e => e.ExpenseDate).ToListAsync();
        }

        public async Task<DailyExpense> AddExpenseAsync(DailyExpense expense)
        {
            await _context.DailyExpenses.AddAsync(expense);
            return expense;
        }

        public async Task<decimal> GetTotalExpensesAsync(DateTime date)
        {
            var targetDate = date.Date;
            return await _context.DailyExpenses
                .Where(e => e.ExpenseDate.Date == targetDate)
                .SumAsync(e => e.Amount);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
