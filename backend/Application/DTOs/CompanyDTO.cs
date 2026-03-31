using System;

namespace DMS.Application.DTOs
{
    public class CompanyDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ContactPerson { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public DateTime CreatedAt { get; set; }
        
        public decimal RunningBalance { get; set; }
    }
}
