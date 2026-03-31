using System;
using System.Collections.Generic;

namespace DMS.Domain.Entities
{
    public class Company
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ContactPerson { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<CompanyLedger> Ledgers { get; set; } = new List<CompanyLedger>();
    }
}
