using System;

namespace DMS.Domain.Entities
{
    public class Stock
    {
        public int StockId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public string? BatchNumber { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string? WarehouseLocation { get; set; }
        public DateTime LastUpdated { get; set; }

        public Product Product { get; set; } = null!;
    }
}
