using System;
using System.Collections.Generic;

namespace DMS.Application.DTOs
{
    public class BulkPaymentDTO
    {
        public int CustomerId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = "Cash";
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
        public List<InvoiceAllocationDTO>? ManualAllocations { get; set; }
    }

    public class InvoiceAllocationDTO
    {
        public int InvoiceId { get; set; }
        public decimal Amount { get; set; }
    }
}
