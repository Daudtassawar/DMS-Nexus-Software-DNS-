namespace DMS.Domain.Entities
{
    public class InvoiceItem
    {
        public int InvoiceItemId { get; set; }
        public int InvoiceId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public int ReturnedQuantity { get; set; } = 0; // For returnable crates/bottles

        public Invoice? Invoice { get; set; }
        public Product? Product { get; set; }
    }
}
