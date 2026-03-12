using System;
using System.Collections.Generic;

namespace DMS.Domain.Entities
{
    public class Salesman
    {
        public int SalesmanId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Area { get; set; }
        public decimal CommissionRate { get; set; } = 0;
        public decimal MonthlyTarget { get; set; } = 0;

        public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
        public ICollection<Customer> Customers { get; set; } = new List<Customer>();
    }
}
