using System;
using System.Collections.Generic;

namespace DMS.Domain.Entities
{
    public class Invoice
    {
        public int InvoiceId { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public int CustomerId { get; set; }
        public int? SalesmanId { get; set; }
        public DateTime InvoiceDate { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal Discount { get; set; }
        public decimal NetAmount { get; set; }
        public string PaymentStatus { get; set; } = "Pending";

        public Customer? Customer { get; set; }
        public Salesman? Salesman { get; set; }
        public ICollection<InvoiceItem> InvoiceItems { get; set; } = new List<InvoiceItem>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
