using System;

namespace DMS.Domain.Entities
{
    public class DailyExpense
    {
        public int ExpenseId { get; set; }
        public string ExpenseTitle { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty; // Fuel, Vehicle Maintenance, Office Expense, Salary, Miscellaneous
        public decimal Amount { get; set; }
        public DateTime ExpenseDate { get; set; } = DateTime.UtcNow;
        public string? Notes { get; set; }
    }
}
