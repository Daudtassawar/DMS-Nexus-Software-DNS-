using System;

namespace DMS.Domain.Entities
{
    public class SystemSetting
    {
        public int Id { get; set; }
        public string CompanyName { get; set; } = "Hamdaan Traders";
        public string? Address { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string? Website { get; set; }
        public string? LogoPath { get; set; }
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}
