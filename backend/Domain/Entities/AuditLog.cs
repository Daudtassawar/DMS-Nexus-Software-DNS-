using System;

namespace DMS.Domain.Entities
{
    public class AuditLog
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Module { get; set; } = string.Empty;
        public string? RecordId { get; set; }
        public string? Description { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? IPAddress { get; set; }
    }
}
