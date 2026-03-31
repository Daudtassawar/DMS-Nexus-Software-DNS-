using System;
using System.Text.Json.Serialization;

namespace DMS.Domain.Entities
{
    public class CustomerLedger
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        [JsonIgnore]
        public Customer? Customer { get; set; }
        
        public TransactionType TransactionType { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? Reference { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        
        // Running balance at the time of this transaction
        public decimal RunningBalance { get; set; }
        
        public string? CreatedByUserId { get; set; }
        public AppUser? CreatedByUser { get; set; }
    }
}
