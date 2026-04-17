using System;

namespace DMS.Application.DTOs
{
    public class SystemSettingDTO
    {
        public int Id { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string? Website { get; set; }
        public string? LogoPath { get; set; }
        public DateTime LastUpdated { get; set; }
    }
}
