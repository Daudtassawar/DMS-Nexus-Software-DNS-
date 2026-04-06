using System;
using System.ComponentModel.DataAnnotations;

namespace DMS.Domain.Entities
{
    public class StockTransaction
    {
        [Key]
        public int TransactionId { get; set; }
        public int ProductId { get; set; }
        public string TransactionType { get; set; } = string.Empty; // In, Out, Return
        public int Quantity { get; set; }
        public DateTime Date { get; set; }
        public string? Reference { get; set; }
        public int? ReferenceId { get; set; }

        public Product Product { get; set; } = null!;
    }
}
