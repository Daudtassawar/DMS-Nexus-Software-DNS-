using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DMS.Application.Interfaces
{
    public interface IAuditLogService
    {
        Task LogActionAsync(string userId, string action, string? ipAddress = null);
        Task LogActionAsync(string userId, string userName, string action, string module, string? description = null, string? recordId = null, string? ipAddress = null);
        Task<List<DMS.Domain.Entities.AuditLog>> GetLogsAsync(string? userId, string? module, DateTime? fromDate, DateTime? toDate);
    }
}
