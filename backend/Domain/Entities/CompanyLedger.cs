using System;
using System.Text.Json.Serialization;

namespace DMS.Domain.Entities
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum TransactionType
    {
        Credit = 1,
        Debit = 2
    }

    public class CompanyLedger
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public Company? Company { get; set; }
        
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
