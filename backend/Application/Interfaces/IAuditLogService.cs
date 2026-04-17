using DMS.Application.DTOs;
using DMS.Domain.Entities;

namespace DMS.Application.Interfaces
{
    public interface IAuditLogService
    {
        Task LogActionAsync(string userId, string action, string? ipAddress = null);
        Task LogActionAsync(string userId, string userName, string action, string module, string? description = null, string? recordId = null, string? ipAddress = null);
        Task<PagedResult<AuditLog>> GetLogsAsync(string? userId, string? module, DateTime? fromDate, DateTime? toDate, int pageNumber = 1, int pageSize = 20);
    }
}
