using System;

namespace DMS.Domain.Entities
{
    public class UserActivityLog
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public AppUser User { get; set; } = null!;
        public DateTime LoginTime { get; set; } = DateTime.UtcNow;
        public string IPAddress { get; set; } = string.Empty;
        public string Status { get; set; } = "Success"; // Success or Failed
        public string Details { get; set; } = string.Empty;
    }
}
