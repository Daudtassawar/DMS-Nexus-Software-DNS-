using System;
using System.Collections.Generic;

namespace DMS.Domain.Entities
{
    public class Customer
    {
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? Area { get; set; }
        public decimal CreditLimit { get; set; } = 0;
        public decimal Balance { get; set; } = 0;
        public int EmptyCratesBalance { get; set; } = 0;
        public int EmptyBottlesBalance { get; set; } = 0;
        
        public int? SalesmanId { get; set; }
        public Salesman? Salesman { get; set; }

        public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    }
}
