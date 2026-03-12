using System;

namespace DMS.Domain.Entities
{
    public class DailyActivity
    {
        public int ActivityId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime ActivityDate { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = string.Empty;
    }
}
