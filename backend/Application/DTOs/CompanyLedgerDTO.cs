using System;
using DMS.Domain.Entities;

namespace DMS.Application.DTOs
{
    public class CompanyLedgerDTO
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public TransactionType TransactionType { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? Reference { get; set; }
        public DateTime Date { get; set; }
        public string? CreatedByUserId { get; set; }
        
        // Split for UI table representation
        public decimal Credit => TransactionType == TransactionType.Credit ? Amount : 0;
        public decimal Debit => TransactionType == TransactionType.Debit ? Amount : 0;
        
        public decimal RunningBalance { get; set; } // Supplied by the Service
    }
}
