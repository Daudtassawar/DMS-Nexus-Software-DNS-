using System;

namespace DMS.Domain.Entities
{
    public class Payment
    {
        public int PaymentId { get; set; }
        public int InvoiceId { get; set; }
        public decimal AmountPaid { get; set; }
        public DateTime PaymentDate { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;

        public Invoice Invoice { get; set; } = null!;
    }
}
