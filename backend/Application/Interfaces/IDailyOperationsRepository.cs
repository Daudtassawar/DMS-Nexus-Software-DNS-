using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Domain.Entities;

namespace DMS.Application.Interfaces
{
    public interface IDailyOperationsRepository
    {
        // Activities
        Task<IEnumerable<DailyActivity>> GetActivitiesAsync(DateTime? date = null);
        Task<DailyActivity> AddActivityAsync(DailyActivity activity);

        // Expenses
        Task<IEnumerable<DailyExpense>> GetExpensesAsync(DateTime? date = null);
        Task<DailyExpense> AddExpenseAsync(DailyExpense expense);
        
        // Calculations
        Task<decimal> GetTotalExpensesAsync(DateTime date);
        
        Task SaveChangesAsync();
    }
}
